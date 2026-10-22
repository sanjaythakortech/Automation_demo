# PDF conversion service

This companion service runs Gotenberg/LibreOffice and converts DOCX to PDF.

## Deploy
Deploy this folder as a Docker service on a platform that supports containers
(for example Render, Railway, Fly.io, Cloud Run, or your own VPS).

The service listens on port 3000.

After deployment, copy the public service URL and set it in Vercel as:

GOTENBERG_URL=https://your-pdf-service.example.com

The Flask app calls:
POST /forms/libreoffice/convert
