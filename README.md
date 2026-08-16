SkillMatch
A decoupled full-stack web application designed to calculate exact match percentages between candidate skills and job requirements using a custom Set Theory algorithm.
View Live 
Vercel Deployment: https://skillmatch-roan.vercel.app/ 
View Render API : https://skillmatch-m4qf.onrender.com/admin
Overview
SkillMatch automates the resume screening process by mathematically evaluating a candidate's skill set against open job requisitions. The frontend provides a clean, responsive interface for data entry, while the backend API handles the heavy lifting, calculating match percentages and managing the persistent PostgreSQL database.
Tech Stack
Frontend : React(Vite) , Javascript?JSX , CS53
Backend : Python , DjangoRestFramework , WhiteNoise
Infrastructure & Deployment : Vercel (Edge Network), Render (Cloud Server), PostgreSQL/SQLite

Core Features
Set Theory Matching Algorithm: Calculates exact alignment between arrays of required skills and candidate capabilities. Decoupled Architecture: Independent client and server environments communicating via RESTful JSON payloads.
Live Database Syncing: Instantaneous cross-origin data fetching from the cloud database to the frontend UI.

Local Setup Instructions

1. Clone the repository:
git clone [https://github.com/abhirup2024/skillmatch.git](https://github.com/abhirup2024/skillmatch.git)

2. Start the Django Backend:
cd skillmatch
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver

3. Start the React Frontend:
Open a new terminal.
cd frontend
npm install
npm run dev
