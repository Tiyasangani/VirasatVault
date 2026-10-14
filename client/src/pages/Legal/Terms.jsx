import { CONTACT_EMAIL, SITE_NAME } from '../../config'
import useDocumentTitle from '../../hooks/useDocumentTitle'

// Starting-point text. Have it reviewed (ideally by a lawyer) and adapt it to your organisation before launch.
export default function Terms() {
  useDocumentTitle('Terms of Use')
  return (
    <>
      <section className="page-head"><div className="container"><h1>Terms of Use</h1><p>Last updated: please add the date when you publish.</p></div></section>
      <section className="section-tight"><div className="container narrow prose legal">
        <h2>1. About {SITE_NAME}</h2>
        <p>{SITE_NAME} is a community archive where people share, discuss and preserve local cultural heritage. By creating an account or using the site you agree to these terms.</p>
        <h2>2. Your account</h2>
        <p>You must provide accurate information and keep your password private. You are responsible for what happens under your account. You can delete your account at any time from your profile page.</p>
        <h2>3. What you may share</h2>
        <p>Only share material that you created, or that you have permission to share: your own photographs, stories you were told and are allowed to retell, recordings made with the speaker’s agreement, and information from sources you credit. Do not upload anything that is copyrighted by someone else, defamatory, hateful, sexual, misleading, or that exposes private information about a person.</p>
        <h2>4. Licence you give us</h2>
        <p>You keep ownership of what you contribute. By submitting it you give {SITE_NAME} a non-exclusive, worldwide, royalty-free licence to store, display and share it on the site and in materials that promote the archive, so that it can be preserved and made available to the public. You can ask us to remove your contribution at any time.</p>
        <h2>5. Review and verification</h2>
        <p>Contributions are reviewed before they appear. A “Verified” mark means a reviewer checked the listed sources at the time. It is not a guarantee that every detail is correct. Reviewers may approve, reject, edit or remove content at their discretion.</p>
        <h2>6. Reviews, comments and conduct</h2>
        <p>Be respectful. We may remove comments or reviews, and suspend accounts, that break these terms or harm others.</p>
        <h2>7. Reporting problems and copyright complaints</h2>
        <p>Use the “Report incorrect information” link on any record, or email <a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If you believe something infringes your copyright, email us with the address of the page, proof that you own the work, and your contact details. We will review it promptly and remove material where appropriate.</p>
        <h2>8. No guarantee</h2>
        <p>The site is provided as it is. Historical information is contributed by the community and may contain mistakes. To the extent the law allows, {SITE_NAME} is not liable for losses arising from using the site.</p>
        <h2>9. Changes</h2>
        <p>We may update these terms. Continuing to use the site after a change means you accept the new terms.</p>
        <h2>10. Contact</h2>
        <p>Questions about these terms: <a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </div></section>
    </>
  )
}
