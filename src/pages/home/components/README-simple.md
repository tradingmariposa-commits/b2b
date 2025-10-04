# Simple steps to deploy (easy, like for a 15-year-old)

1) Make sure your repo has a build script:
   - Open package.json in repo root
   - Make sure there is a "build" script (example: "build": "vite build" or "build": "react-scripts build")

2) Add the files I gave above:
   - .github/workflows/deploy.yml
   - src/pages/home/components/ContactSection.jsx
   - netlify/functions/sendWhatsApp.js (only if you want the owner auto‑WhatsApp)

3) Commit everything. Push to your main branch (if you used GitHub web UI committing will do it).

4) Go to the Actions tab in GitHub, click the workflow, watch the job logs.
   - If it succeeds, the peaceiris action will publish to GitHub Pages.
   - GitHub Pages URL will be: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/ (may take a minute)

5) Configure Formspree (email):
   - Go to https://formspree.io/
   - Create a form, they’ll give you an endpoint like https://formspree.io/f/abcd
   - Replace FORM_ENDPOINT in src/pages/home/components/ContactSection.jsx with that URL and commit.

6) (Optional) To make owner get WhatsApp automatically:
   - Sign up for Twilio and enable WhatsApp (Twilio docs explain steps).
   - In Twilio, get ACCOUNT_SID, AUTH_TOKEN, and a WhatsApp-enabled 'From' (like 'whatsapp:+1415XXXXXXX')
   - In your Netlify site settings (if you deploy to Netlify), add the environment variables:
     - TWILIO_ACCOUNT_S
