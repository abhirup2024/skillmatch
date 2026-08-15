import { useState, useEffect } from 'react'

function App() {
  // Read State
  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)

  // Write State (For the Form)
  const [skills, setSkills] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSkills, setNewSkills] = useState([])

  // 1. Initial Load: Fetch Resumes AND available Skills
  useEffect(() => {
    // Fetch Resumes from Render
    fetch('https://skillmatch-m4qf.onrender.com/api/resume/')
      .then(response => response.json())
      .then(data => {
        setResumes(data)
        if (data.length > 0) setSelectedResumeId(data[0].id)
      })

    // Fetch Skills from Render (to populate the form checkboxes)
    fetch('https://skillmatch-m4qf.onrender.com/api/skills/')
      .then(response => response.json())
      .then(data => setSkills(data))
  }, [])

  // 2. Fetch specific match data when dropdown changes
  useEffect(() => {
    if (!selectedResumeId) return;

    setLoading(true)
    fetch(`https://skillmatch-m4qf.onrender.com/api/resume/${selectedResumeId}/match/`)
      .then(response => response.json())
      .then(data => {
        setMatches(data)
        setLoading(false)
      })
  }, [selectedResumeId])

  // 3. Handle Form Submission (The POST Request)
  const handleAddCandidate = (e) => {
    e.preventDefault() // Prevents the browser from reloading the page
    
    const payload = {
      candidate_name: newName,
      extracted_skills: newSkills // This is an array of Skill IDs
    }

    fetch('https://skillmatch-m4qf.onrender.com/api/resume/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      // Add the new candidate to the dropdown list
      setResumes([...resumes, data])
      // Automatically select the new candidate to run their match math
      setSelectedResumeId(data.id)
      // Reset and hide the form
      setNewName('')
      setNewSkills([])
      setShowForm(false)
    })
    .catch(error => console.error("Error adding candidate:", error))
  }

  // Helper function to handle checking/unchecking skills
  const handleSkillToggle = (skillId) => {
    if (newSkills.includes(skillId)) {
      setNewSkills(newSkills.filter(id => id !== skillId))
    } else {
      setNewSkills([...newSkills, skillId])
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>SkillMatch Dashboard</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '10px 15px', backgroundColor: showForm ? '#ff4d4d' : '#4ade80', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {showForm ? 'Cancel' : '+ Add Candidate'}
        </button>
      </div>

      {/* The Creation Form */}
      {showForm && (
        <form onSubmit={handleAddCandidate} style={{ backgroundColor: '#222', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #4ade80' }}>
          <h3>New Candidate Profile</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Candidate Name:</label>
            <input 
              type="text" 
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Select Skills:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {skills.map(skill => (
                <label key={skill.id} style={{ backgroundColor: '#333', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={newSkills.includes(skill.id)}
                    onChange={() => handleSkillToggle(skill.id)}
                    style={{ marginRight: '8px' }}
                  />
                  {skill.name}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4ade80', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Save Candidate
          </button>
        </form>
      )}
      
      {/* The Dynamic Dropdown Menu */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#222', borderRadius: '8px' }}>
        <label htmlFor="resume-select" style={{ marginRight: '10px', fontSize: '1.2rem' }}>Select Candidate: </label>
        <select 
          id="resume-select"
          value={selectedResumeId} 
          onChange={(e) => setSelectedResumeId(e.target.value)}
          style={{ padding: '8px', fontSize: '1rem', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: '1px solid #444' }}
        >
          {resumes.map(resume => (
            <option key={resume.id} value={resume.id}>
              {resume.candidate_name} (ID: {resume.id})
            </option>
          ))}
        </select>
      </div>

      {/* The Match Results */}
      {loading ? (
        <p>Calculating matches...</p>
      ) : (
        <div>
          {matches.map((match) => (
            <div key={match.job_id} style={{ border: '1px solid #444', margin: '15px 0', padding: '15px', borderRadius: '8px', backgroundColor: '#1a1a1a' }}>
              <h2 style={{ marginTop: 0 }}>{match.job_title}</h2>
              <h3 style={{ color: match.match_percentage > 50 ? '#4ade80' : '#ff4d4d' }}>
                Match Score: {match.match_percentage}%
              </h3>
              
              <div style={{ display: 'flex', gap: '40px' }}>
                <div>
                  <p><strong>Matched Skills:</strong></p>
                  <ul style={{ color: '#4ade80' }}>
                    {match.matched_skills.length > 0 ? (
                      match.matched_skills.map(skill => <li key={skill}>{skill}</li>)
                    ) : <li style={{color: '#888'}}>None</li>}
                  </ul>
                </div>

                <div>
                  <p><strong>Missing Skills:</strong></p>
                  <ul style={{ color: '#ff4d4d' }}>
                    {match.missing_skills.length > 0 ? (
                      match.missing_skills.map(skill => <li key={skill}>{skill}</li>)
                    ) : <li style={{color: '#888'}}>None</li>}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App