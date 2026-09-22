"use client";

import React, { useRef } from "react";
import TesterForm from "./index";
import TesterBanner from "./TesterBanner";
import { useEffect } from "react";

const TesterSection = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
  if (window.location.hash === "#form") {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, []);

  return (
    <div>
      <TesterBanner onSignUpClick={scrollToForm} />
      <div ref={formRef}>
        <TesterForm />
      </div>
    </div>
  );
};

export default TesterSection;
