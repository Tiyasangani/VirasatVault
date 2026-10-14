import { CONTACT_EMAIL, SITE_NAME } from '../../config'
import useDocumentTitle from '../../hooks/useDocumentTitle'

// Starting-point text. Check it matches what you really collect, and have it reviewed before launch.
export default function Privacy() {
  useDocumentTitle('Privacy Policy')
  return (
    <>
      <section className="page-head"><div className="container"><h1>Privacy Policy</h1><p>Last updated: please add the date when you publish.</p></div></section>
      <section className="section-tight"><div className="container narrow prose legal">
        <h2>What we collect</h2>
        <p><strong>When you register:</strong> your name, email address, password (stored only as a one-way hash, never in readable form), village and district, and the time you accepted these terms.</p>
        <p><strong>When you use the site:</strong> the contributions you submit (text, photographs, audio, video, sources), your comments, reviews, likes, saved items and playlists, and notifications sent to you.</p>
        <p><strong>Technical data:</strong> our server records your IP address and the pages requested in its logs, for security and fixing problems.</p>
        <h2>What is public</h2>
        <p>Your name appears next to contributions that are published, and on your comments and reviews. Playlists you mark as public can be opened by anyone who has their link; private playlists are visible only to you. Your public contributor page shows your name, village, district, points and approved records. Your email address is never shown publicly.</p>
        <h2>How we use it</h2>
        <p>To run the archive, review submissions, send you notifications and password-reset emails, keep the site secure and prevent abuse. We do not sell your data and we do not show advertising.</p>
        <h2>Cookies and similar storage</h2>
        <p>{SITE_NAME} does not use advertising or tracking cookies. Your browser stores a login token and your recent searches so the site works as you expect. These are essential and stay on your device.</p>
        <h2>Services we use</h2>
        <p>Your data is stored with our hosting, database and file-storage providers, and email is sent through an email provider. Map backgrounds come from OpenStreetMap and fonts from Google Fonts, so your browser contacts those services when you open a page that uses them.</p>
        <h2>Your choices</h2>
        <p>You can delete your account from your profile page. Your likes, saved items, playlists, reviews and notifications are removed, and your name is removed from anything you published (it then shows as “Former contributor”). You can ask us to correct or remove your data by emailing <a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
        <h2>Security</h2>
        <p>We use encrypted connections, hashed passwords and access controls, but no system is perfectly secure. Choose a strong, unique password.</p>
        <h2>Children</h2>
        <p>{SITE_NAME} is not intended for children under 13.</p>
        <h2>Contact</h2>
        <p><a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </div></section>
    </>
  )
}
