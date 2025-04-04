import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import './index.scss';

const Contact = () => {
  // Fonction pour charger le widget Ko-fi
  useEffect(() => {
    // Cette technique garantit que le script n'est chargé qu'une seule fois
    const kofiScript = document.getElementById('kofi-widget-script');
    if (!kofiScript) {
      const script = document.createElement('script');
      script.id = 'kofi-widget-script';
      script.src = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact</h1>
        <p>N'hésitez pas à me contacter pour toute question ou suggestion concernant ChesSchool.</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h2>Informations de contact</h2>
          
          <div className="contact-grid">
            <div className="contact-item">
              <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
              <div>
                <h3>Email</h3>
                <p><a href="mailto:contact.slashend@gmail.com">contact.slashend@gmail.com</a></p>
              </div>
            </div>
            
            <div className="contact-item">
              <FontAwesomeIcon icon={faGithub} className="contact-icon" />
              <div>
                <h3>GitHub</h3>
                <p><a href="https://github.com/Douwdy" target="_blank" rel="noopener noreferrer">github.com/Douwdy</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;