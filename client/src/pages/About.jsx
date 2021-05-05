import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import file from '../assets/about.md';

import '../theme/about.css';

const About = () => {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    fetch(file)
      .then((res) => res.text())
      .then((text) => setMarkdown(text));
  }, []);

  return (
    <div className="aboutPage">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};

export default About;
