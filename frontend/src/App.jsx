import { useState, useEffect } from 'react'

function App() {
  // Read State
  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)

  // Write State (For the Form & Advanced Engine)
  const [skills, setSkills] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedSkills, setSelectedSkills] = useState({}) // Stores { "React": 2026 }

  const API_BASE = 'https://skillmatch-m4qf.onrender.com/api'

  // Helper function to fetch resumes so we can call it after deleting/adding
  const fetchResumes = () => {
    fetch(`${API_BASE}/resume/`)
      .then(response => response.json())
      .then(data => {
        setResumes(data)
        if (data.length > 0) {
          // Only auto-select if nothing is currently selected
          setSelectedResumeId(prev => prev ? prev : data[0].id)
        } else {
          setSelectedResumeId('')
          setMatches([])
        }
      })
  }

  // 1. Initial Load: Fetch Resumes AND available Skills
  useEffect(() => {
    fetchResumes()
    fetch(`${API_BASE}/skills/`)
      .then(response => response.json())
      .then(data => setSkills(data))
  }, [])

  // 2. Fetch specific match data when dropdown changes
  useEffect(() => {
    if (!selectedResumeId) return;

    setLoading(true)
    fetch(`${API_BASE}/resume/${selectedResumeId}/match/`)
      .then(response => response.json())
      .then(data => {
        setMatches(data)
        setLoading(false)
      })
      .catch(error => {
        console.error("Error fetching matches:", error)
        setLoading(false)
      })
  }, [selectedResumeId])

  // 3. Handle Form Submission for the Time-Decay Backend
  const handleAddCandidate = (e) => {
    e.preventDefault()
    
    const skillsPayload = Object.entries(selectedSkills).map(([skillName, year]) => ({
      name: skillName,
      last_used: year
    }));
    const extractedSkillsIds = skills
      .filter(skill => selectedSkills[skill.name])
      .map(skill => skill.id);

    
    const payload = {
      candidate_name: newName,
      skills_data: skillsPayload,
      extracted_skills: extractedSkillsIds 
    }

    fetch(`${API_BASE}/resume/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
        // If Django rejects it, throw the exact error message!
        throw new Error(JSON.stringify(data));
      }
      return data;
    })
    .then(data => {
      // On success, pull the fresh, correct list directly from the database
      fetchResumes(); 
      setSelectedResumeId(data.id);
      setNewName('');
      setSelectedSkills({});
      setShowForm(false);
    })
    .catch(error => {
      console.error("Error adding candidate:", error);
      alert(`Backend rejected the candidate. Error: ${error.message}`);
    })
  }

  // 4. Handle Deleting a Candidate
  const deleteCandidate = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
  
    try {
      const response = await fetch(`${API_BASE}/resume/${candidateId}/`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        alert("Candidate successfully deleted.");
        fetchResumes(); // Refresh the list
      } else {
        alert("Failed to delete candidate.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // 5. Helpers for the Checkboxes and Year Inputs
  const handleToggle = (skillName) => {
    setSelectedSkills(prev => {
      const updated = { ...prev };
      if (updated[skillName]) {
        delete updated[skillName]; // Uncheck
      } else {
        updated[skillName] = new Date().getFullYear(); // Check and default to current year
      }
      return updated;
    });
  };

  const handleYearChange = (skillName, year) => {
    setSelectedSkills(prev => ({
      ...prev,
      [skillName]: parseInt(year, 10) || new Date().getFullYear()
    }));
  };

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
            <label style={{ display: 'block', marginBottom: '10px' }}>Select Skills & Last Used Year:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {skills.map(skill => (
                <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#333', padding: '8px', borderRadius: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
                    <input 
                      type="checkbox" 
                      checked={!!selectedSkills[skill.name]}
                      onChange={() => handleToggle(skill.name)}
                      style={{ marginRight: '8px' }}
                    />
                    {skill.name}
                  </label>

                  {/* Year Input (Only visible if checked) */}
                  {selectedSkills[skill.name] && (
                    <input 
                      type="number" 
                      min="1990" 
                      max={new Date().getFullYear()} 
                      value={selectedSkills[skill.name]} 
                      onChange={(e) => handleYearChange(skill.name, e.target.value)} 
                      style={{ width: '70px', padding: '4px', borderRadius: '4px', border: 'none', textAlign: 'center', color: '#000' }}
                      title="Year last used"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4ade80', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Save Candidate
          </button>
        </form>
      )}
      
      {/* The Dynamic Dropdown Menu & Delete Button */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#222', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <label htmlFor="resume-select" style={{ fontSize: '1.2rem' }}>Select Candidate: </label>
        
        <select 
          id="resume-select"
          value={selectedResumeId} 
          onChange={(e) => setSelectedResumeId(e.target.value)}
          style={{ padding: '8px', fontSize: '1rem', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: '1px solid #444', flex: 1 }}
        >
          {resumes.map(resume => (
            <option key={resume.id} value={resume.id}>
              {resume.candidate_name} (ID: {resume.id})
            </option>
          ))}
        </select>

        {/* Delete Button added right next to the select dropdown! */}
        {selectedResumeId && (
          <button 
            onClick={() => deleteCandidate(selectedResumeId)} 
            style={{ padding: '8px 12px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Delete Profile
          </button>
        )}
      </div>

      {/* The Match Results */}
      {loading ? (
        <p>Calculating matches...</p>
      ) : (
        <div>
          {Array.isArray(matches) ? matches.map((match) => (
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
          )) : (
            <p style={{ color: '#ff4d4d' }}>No valid match data available. Please select a different candidate.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default App