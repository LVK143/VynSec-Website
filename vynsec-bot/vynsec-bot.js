const chatBox = document.getElementById("chatBox");
const quickReplies = document.getElementById("quickReplies");
const widget = document.getElementById("vynsec-chat-widget");

document.getElementById("vynsec-chat-toggle").onclick = () => widget.classList.toggle("hidden");
document.getElementById("close-chat").onclick = () => widget.classList.add("hidden");

let session = {
  step: 0,
  riskScore: 0,
  flow: "assessment",
  email: "",
  phone: ""
};

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.innerHTML = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function bot(text, replies = []) {
  setTimeout(() => {
    addMessage(text, "bot");
    showReplies(replies);
  }, 500);
}

function showReplies(options) {
  quickReplies.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => handleInput(opt.toLowerCase());
    quickReplies.appendChild(btn);
  });
}

function sendMessage() {
  const input = document.getElementById("userInput");
  const value = input.value.trim();
  if (!value) return;
  input.value = "";
  handleInput(value.toLowerCase(), value);
}

function handleInput(answer, originalText = null) {
  addMessage(originalText || answer, "user");
  quickReplies.innerHTML = "";

  if (session.step === 5) {
    session.email = originalText;
    session.step++;
    return bot("📱 Enter your WhatsApp number (with country code) to receive your report:");
  }

  if (session.step === 6) {
    session.phone = originalText;
    saveLead();
    return bot("✅ Your detailed security report has been sent! Our team may contact you shortly.");
  }

  if (session.step === 0) {
    session.step++;
    return bot("What type of system do you have?", ["eCommerce", "SaaS App", "Corporate Website", "Other"]);
  }

  if (session.step === 1) {
    if (answer.includes("ecommerce") || answer.includes("saas")) session.riskScore += 3;
    session.step++;
    return bot("Do users create accounts or log in?", ["Yes", "No"]);
  }

  if (session.step === 2) {
    if (answer === "yes") session.riskScore += 3;
    session.step++;
    return bot("Do you process online payments?", ["Yes", "No"]);
  }

  if (session.step === 3) {
    if (answer === "yes") session.riskScore += 4;
    session.step++;
    return bot("Do you need compliance (ISO, SOC2, GDPR)?", ["Yes", "No", "Not Sure"]);
  }

  if (session.step === 4) {
    if (answer === "yes") session.riskScore += 2;
    session.step++;
    showResults();
  }
}

function showResults() {
  let level = "Low";
  if (session.riskScore >= 8) level = "High";
  else if (session.riskScore >= 4) level = "Medium";

  bot(`🔐 <strong>Your Risk Level: ${level}</strong><br>
  Enter your work email to receive a detailed security report:`);
}

function saveLead() {
  fetch("https://script.google.com/macros/s/AKfycby9PL9mEpJ3xMj8Vhk88gY-wgwa3jG5R39nOVpu689ZzDCnA5SJ7QMq7iYmCX_GsIEsNQ/exec", {
    method: "POST",
    body: JSON.stringify({
      email: session.email,
      phone: session.phone,
      risk: session.riskScore,
      date: new Date().toISOString()
    }),
    headers: { "Content-Type": "application/json" }
  });
}
