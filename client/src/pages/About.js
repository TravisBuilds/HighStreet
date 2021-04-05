import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import file from "../assets/about.md";

export const About =  () => {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    fetch(file)
      .then((res) => res.text())
      .then((text) => setMarkdown(text));
  }, []);

  return (
    <div>
        <div style={{width:"80%"}}>
        <ReactMarkdown source={markdown} />
        </div>
    </div>
  );
}