import React, { useState, useEffect } from 'react';

// Replace FORM_ENDPOINT with your Formspree endpoint (or use Netlify Forms)
// Example Formspree endpoint: https://formspree.io/f/xxxxx
const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

const OWNER_PHONE = '+923001234567'; // owner WhatsApp number for visitor-opened link

export default function ContactSection() {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [weight, setWeight] = useState('');
  const [country, setCountry] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('ps'); // 'ps' = Pashto, 'en' = English
  const [status, setStatus] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('lang');
    if (saved) setLanguage(saved);
  }, []);

  function saveLang(lang) {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  }

  function buildMessage() {
    if (language === 'en') {
      return `Hello! I have an inquiry:\nProduct: ${productName || 'Not provided'}\nQuantity: ${quantity || 'Not provided'}\nWeight: ${weight || 'Not provided'}\nCountry: ${country || 'Not provided'}\nPhone: ${telephone}\nEmail: ${email || 'Not provided'}`;
    } else {
      return `سلام! زه د دغو محصولاتو په اړه پوښتنه لرم:\nمحصول: ${productName || 'نه دی ورکړل شوي'}\nمقدار: ${quantity || 'نه دی ورکړل شوي'}\nوزن: ${weight || 'نه دی ورکړل شوي'}\nهېواد: ${country || 'نه دی ورکړل شوي'}\nتلیفون: ${telephone}\nایمیل: ${email || 'نه دی ورکړل شوي'}`;
    }
  }

  function openVisitorWhatsApp() {
    if (!telephone) {
      setStatus(language === 'en' ? 'Please enter your phone number.' : 'مهرباني وکړئ خپل تلیفون نمبر دننه کړئ.');
      return;
    }
    const text = buildMessage();
    const url = `https://wa.me/${OWNER_PHONE.replace(/\+/g,'')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  async function postToFormspree() {
    // simple email via Formspree
    try {
      const resp = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName, quantity, weight, country, telephone, email, language
        })
      });
      return resp.ok;
    } catch {
      return false;
    }
  }

  async function postToOwnerWhatsAppFunction() {
    // Attempt to notify owner automatically (Netlify function path)
    // This will work only if you deployed the netlify function and set Twilio env vars.
    try {
      const resp = await fetch('/.netlify/functions/sendWhatsApp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, quantity, weight, country, telephone, email, language })
      });
      return resp.ok;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    if (!telephone) {
      setStatus(language === 'en' ? 'Telephone is required.' : 'تلیفون لازمي دی.');
      return;
    }

    // 1) send email via Formspree
    const emailOk = await postToFormspree();

    // 2) call serverless function to notify owner on WhatsApp (optional)
    const ownerOk = await postToOwnerWhatsAppFunction();

    // 3) also open visitor's WhatsApp so visitor can send message themselves (optional)
    const openVisitor = true; // set false if you don't want to auto-open
    if (openVisitor) {
      openVisitorWhatsApp();
    }

    if (emailOk || ownerOk) {
      setStatus(language === 'en' ? 'Submitted! You will get a reply soon.' : 'ستاسو پیغام وسپارل شو! ژر به تاسې ته ځواب درکړل شي.');
      // clear optional fields if you want:
      setProductName(''); setQuantity(''); setWeight(''); setCountry(''); setEmail('');
    } else {
      setStatus(language === 'en' ? 'Submission sent but some notifications failed.' : 'پیغام وسپارل شو مګر ځینې اطلاعونه ناکامه شول.');
    }
  }

  return (
    <section dir={language === 'ps' ? 'rtl' : 'ltr'}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => saveLang('ps')}>پښتو</button>
          <button onClick={() => saveLang('en')}>English</button>
        </div>

        <h2>{language === 'en' ? 'Contact / Inquiry' : 'اړیکه / پوښتنه'}</h2>

        <form onSubmit={handleSubmit}>
          <label>{language === 'en' ? 'Product name (optional)' : 'د محصول نوم (اختیاري)'}</label>
          <input value={productName} onChange={e => setProductName(e.target.value)} />

          <label>{language === 'en' ? 'Quantity (optional)' : 'مقدار (اختیاري)'}</label>
          <input value={quantity} onChange={e => setQuantity(e.target.value)} />

          <label>{language === 'en' ? 'Weight (optional)' : 'وزن (اختیاري)'}</label>
          <input value={weight} onChange={e => setWeight(e.target.value)} />

          <label>{language === 'en' ? 'Country (optional)' : 'هېواد (اختیاري)'}</label>
          <input value={country} onChange={e => setCountry(e.target.value)} />

          <label style={{ fontWeight: 'bold' }}>{language === 'en' ? 'Telephone (required)' : 'تلیفون (لازمي)'}</label>
          <input value={telephone} onChange={e => setTelephone(e.target.value)} required />

          <label>{language === 'en' ? 'Email (optional)' : 'ایمیل (اختیاري)'}</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button type="submit">{language === 'en' ? 'Submit' : 'واستوئ'}</button>
            <button type="button" onClick={openVisitorWhatsApp}>
              {language === 'en' ? 'Open WhatsApp (prefill)' : 'واټس اپ خلاص او معلومات پری ډک کړي'}
            </button>
          </div>
        </form>

        {status && <p style={{ marginTop: 12 }}>{status}</p>}

        {/* Floating WhatsApp quick icon */}
        <a
          href={`https://wa.me/${OWNER_PHONE.replace(/\+/g,'')}?text=${encodeURIComponent(buildMessage())}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            left: 16,
            bottom: 16,
            background: '#25D366',
            color: 'white',
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          WA
        </a>
      </div>
    </section>
  );
}
