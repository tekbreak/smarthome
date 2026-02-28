export const useVoice = () => {
  const speech = new SpeechSynthesisUtterance();

  const say = (message: string) => {
    speech.text = message;
    console.log("say", message);
    window.speechSynthesis.speak(speech);
  };

  return { say };
};
