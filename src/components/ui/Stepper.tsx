import React from "react";

type Step = {
  label: string;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
};

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <ol className="flex items-center mx-auto max-w-[400px] mt-6 justify-center w-full text-xs text-gray-900 font-medium sm:text-base">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <li
            key={index}
            className={`flex w-full relative after:content-[''] after:w-full after:h-0.5 after:inline-block after:absolute lg:after:top-5 after:top-3 after:left-8 transition-all duration-300
              ${
                index < steps.length - 1
                  ? isCompleted
                    ? "after:bg-indigo-600"
                    : "after:bg-gray-200"
                  : "after:hidden !w-auto"
              }
            `}
          >
            <div className="block whitespace-nowrap z-10 mr-2.5 text-center">
              <span
                className={`w-6 h-6 lg:w-10 lg:h-10 border-2 rounded-full flex justify-center items-center mx-auto mb-3 text-sm transition-all duration-300
                  ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : isCompleted
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-gray-200 text-gray-900 border-transparent"
                  }
                `}
              >
                {stepNumber}
              </span>
              {step.label}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default Stepper;
