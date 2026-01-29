// Advanced VynSec Cyber Assistant
const chatBox = document.getElementById("chatBox");
const quickReplies = document.getElementById("quickReplies");
const widget = document.getElementById("vynsec-chat-widget");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// State Management
let session = {
  step: 0,
  riskScore: 0,
  flow: "assessment",
  email: "",
  phone: "",
  company: "",
  systemType: "",
  hasLogin: false,
  hasPayments: false,
  needsCompliance: false
};

// Auto-open chat after 3 seconds
setTimeout(() => {
  openChat();
  // Add slight delay before showing welcome message
  setTimeout(() => {
    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      bot(`👋 <strong>Welcome to VynSec!</strong><br><br>
      I'm your AI Cybersecurity Assistant. I can help you:<br>
      • Assess your security risk in under 60 seconds<br>
      • Get personalized recommendations<br>
      • Learn about our AI-powered solutions<br><br>
      <small><i>Your data is encrypted and secure.</i></small>`, 
      ["Start Security Assessment", "Learn About VynSec", "Contact Sales"]);
    }, 1500);
  }, 500);
}, 3000);

// DOM Elements
document.getElementById("vynsec-chat-toggle").onclick = openChat;
document.querySelector(".close-btn").onclick = closeChat;
document.querySelector(".minimize-btn").onclick = minimizeChat;

// Event Listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Attach quick reply handlers
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("quick-reply-btn")) {
    handleInput(e.target.dataset.reply, e.target.textContent);
  }
});

// Functions
function openChat() {
  widget.classList.remove("hidden");
  widget.classList.remove("minimized");
  userInput.focus();
}

function closeChat() {
  widget.classList.add("hidden");
}

function minimizeChat() {
  widget.classList.toggle("minimized");
  if (widget.classList.contains("minimized")) {
    chatBox.style.display = "none";
    quickReplies.style.display = "none";
    document.querySelector(".chat-input-container").style.display = "none";
    document.querySelector(".chat-footer").style.display = "none";
  } else {
    chatBox.style.display = "flex";
    quickReplies.style.display = "flex";
    document.querySelector(".chat-input-container").style.display = "flex";
    document.querySelector(".chat-footer").style.display = "block";
  }
}

function addMessage(text, sender, options = {}) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  let avatar = "";
  if (sender === "bot") {
    avatar = `<div class="bot-avatar"><i class="fas fa-robot"></i></div>`;
  }
  
  let senderName = sender === "bot" ? "VynSec AI" : "You";
  
  messageDiv.innerHTML = `
    <div class="message-content">
      ${avatar}
      <div class="message-text">
        <div class="message-sender">${senderName}</div>
        ${text}
      </div>
    </div>
    <div class="message-time">${time}</div>
  `;
  
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  // Add animation for new messages
  messageDiv.style.animation = "messageAppear 0.3s ease";
  
  return messageDiv;
}

function bot(text, replies = [], delay = 800) {
  showTypingIndicator();
  
  setTimeout(() => {
    removeTypingIndicator();
    addMessage(text, "bot");
    
    if (replies.length > 0) {
      showReplies(replies);
    } else {
      quickReplies.innerHTML = "";
    }
    
    // Update progress bar
    updateProgress();
  }, delay);
}

function showReplies(options) {
  quickReplies.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "quick-reply-btn";
    btn.setAttribute("data-reply", opt.toLowerCase().replace(/\s+/g, '-'));
    btn.innerHTML = opt;
    quickReplies.appendChild(btn);
  });
  quickReplies.style.display = "flex";
}

function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "typing-indicator";
  typingDiv.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  typingDiv.id = "typingIndicator";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById("typingIndicator");
  if (typing) typing.remove();
}

function sendMessage() {
  const value = userInput.value.trim();
  if (!value) return;
  
  handleInput(value.toLowerCase(), value);
  userInput.value = "";
}

function handleInput(answer, originalText = null) {
  addMessage(originalText || answer, "user");
  quickReplies.innerHTML = "";
  
  switch (session.step) {
    case 0: // Initial choice
      if (answer.includes("start") || answer.includes("assessment")) {
        session.step = 1;
        bot("Great! Let's assess your security posture.<br><br>First, what's your company name?", []);
      } else if (answer.includes("learn")) {
        session.flow = "info";
        bot("VynSec provides AI-driven cybersecurity solutions including:<br><br>• Threat Detection & Response<br>• Vulnerability Management<br>• Compliance Automation<br>• Security Awareness Training<br><br>Want to see how we can protect your business?", ["Yes, Show Solutions", "Start Assessment", "Talk to Human"]);
      } else {
        bot("How can I help you today?", ["Start Security Assessment", "Learn About VynSec", "Contact Sales"]);
      }
      break;
      
    case 1: // Company name
      session.company = originalText;
      session.step++;
      bot(`Thanks, ${originalText}!<br><br>What type of system do you need to secure?`, 
        ["SaaS Application", "eCommerce Platform", "Corporate Website", "Mobile App", "Internal Network"]);
      break;
      
    case 2: // System type
      session.systemType = originalText;
      if (originalText.includes("saas") || originalText.includes("ecommerce")) {
        session.riskScore += 3;
      }
      session.step++;
      bot("Do users create accounts or log into your system?", ["Yes", "No", "Not Applicable"]);
      break;
      
    case 3: // User accounts
      session.hasLogin = answer === "yes";
      if (answer === "yes") session.riskScore += 3;
      session.step++;
      bot("Do you process online payments or handle sensitive financial data?", 
        ["Yes, we process payments", "We handle financial data", "No financial data"]);
      break;
      
    case 4: // Payments
      session.hasPayments = answer.includes("yes") || answer.includes("financial");
      if (session.hasPayments) session.riskScore += 4;
      session.step++;
      bot("Do you need to comply with regulations like ISO 27001, SOC2, GDPR, or HIPAA?", 
        ["Yes, we need compliance", "Not sure", "No compliance needed"]);
      break;
      
    case 5: // Compliance
      session.needsCompliance = answer.includes("yes");
      if (session.needsCompliance) session.riskScore += 2;
      session.step++;
      showRiskAssessment();
      break;
      
    case 6: // Email collection
      if (validateEmail(originalText)) {
        session.email = originalText;
        session.step++;
        bot("📧 Got it!<br><br>Would you like to receive your security report via WhatsApp? If yes, please share your number with country code.", 
          ["Yes, send via WhatsApp", "Email is fine"]);
      } else {
        bot("Please enter a valid work email address:", []);
      }
      break;
      
    case 7: // Phone collection
      if (answer.includes("whatsapp") || answer.includes("yes")) {
        session.step++;
        bot("Perfect! Please share your WhatsApp number with country code:", []);
      } else {
        generateReport();
      }
      break;
      
    case 8: // Final phone
      session.phone = originalText;
      generateReport();
      break;
      
    default:
      bot("I'm not sure how to help with that. Would you like to start a security assessment?", 
        ["Start Assessment", "Contact Support"]);
  }
}

function showRiskAssessment() {
  let level = "Low";
  let levelClass = "risk-low";
  let recommendations = [];
  
  if (session.riskScore >= 8) {
    level = "High";
    levelClass = "risk-high";
    recommendations = [
      "Immediate vulnerability assessment",
      "24/7 threat monitoring",
      "Incident response plan"
    ];
  } else if (session.riskScore >= 4) {
    level = "Medium";
    levelClass = "risk-medium";
    recommendations = [
      "Regular security audits",
      "Employee training",
      "Basic monitoring"
    ];
  } else {
    recommendations = [
      "Basic security hygiene",
      "Regular updates",
      "Backup strategy"
    ];
  }
  
  const recommendationsHTML = recommendations.map(rec => 
    `✓ ${rec}`).join('<br>');
  
  bot(`🔐 <strong>Security Assessment Complete</strong><br><br>
    <div class="${levelClass} risk-badge">${level} Risk Level</div><br><br>
    <strong>Based on your inputs:</strong><br>
    • System: ${session.systemType}<br>
    • User Accounts: ${session.hasLogin ? 'Yes' : 'No'}<br>
    • Financial Data: ${session.hasPayments ? 'Yes' : 'No'}<br>
    • Compliance Needs: ${session.needsCompliance ? 'Yes' : 'No'}<br><br>
    <strong>Recommendations:</strong><br>
    ${recommendationsHTML}<br><br>
    Enter your work email to receive the detailed report:`, []);
}

function generateReport() {
  // Show report generation animation
  showTypingIndicator();
  
  setTimeout(() => {
    removeTypingIndicator();
    
    bot(`📋 <strong>Your Security Report is Ready!</strong><br><br>
      We've prepared a comprehensive 12-page security assessment for <strong>${session.company}</strong>.<br><br>
      <strong>Key Findings:</strong><br>
      • Risk Score: ${session.riskScore}/12<br>
      • Priority Areas: ${session.hasPayments ? 'Payment Security, ' : ''}${session.hasLogin ? 'Access Control, ' : ''}Data Protection<br>
      • Next Steps: Schedule a free consultation with our experts<br><br>
      <div class="risk-badge risk-${session.riskScore >= 8 ? 'high' : session.riskScore >= 4 ? 'medium' : 'low'}">
        ${session.riskScore >= 8 ? '🟡 Schedule Immediate Review' : session.riskScore >= 4 ? '🟢 Moderate Priority' : '🔵 Good Baseline'}
      </div><br><br>
      ✅ Your report has been sent to ${session.email}${session.phone ? ` and ${session.phone}` : ''}.<br><br>
      <small>A VynSec security expert will contact you within 24 hours.</small>`, 
      ["Download Report", "Schedule Consultation", "Start New Assessment"]);
    
    saveLead();
    
    // Reset for new conversation
    setTimeout(() => {
      session.step = 0;
      session.riskScore = 0;
    }, 10000);
  }, 2000);
}

function updateProgress() {
  const totalSteps = 6;
  const progress = (session.step / totalSteps) * 100;
  
  let progressBar = document.querySelector(".progress-fill");
  if (!progressBar) {
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";
    progressContainer.innerHTML = `
      <div class="progress-text">
        <span>Security Assessment</span>
        <span>${Math.min(session.step, totalSteps)}/${totalSteps}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
    `;
    widget.insertBefore(progressContainer, chatBox);
  } else {
    progressBar.style.width = `${progress}%`;
    document.querySelector(".progress-text span:last-child").textContent = 
      `${Math.min(session.step, totalSteps)}/${totalSteps}`;
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function saveLead() {
  const leadData = {
    timestamp: new Date().toISOString(),
    company: session.company,
    email: session.email,
    phone: session.phone,
    systemType: session.systemType,
    riskScore: session.riskScore,
    hasLogin: session.hasLogin,
    hasPayments: session.hasPayments,
    needsCompliance: session.needsCompliance,
    source: "Chatbot Assessment"
  };
  
  // Log to console (replace with your actual API endpoint)
  console.log("Lead captured:", leadData);
  
  // Example: Send to Google Sheets
  fetch("https://script.google.com/macros/s/AKfycby9PL9mEpJ3xMj8Vhk88gY-wgwa3jG5R39nOVpu689ZzDCnA5SJ7QMq7iYmCX_GsIEsNQ/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(leadData)
  }).catch(err => console.log("Failed to save lead:", err));
  
  // Send confirmation email (pseudo-code)
  // sendEmailConfirmation(session.email, session.company);
}

// Add some sample conversation starters
function addSampleQuestions() {
  const samples = [
    "What's the biggest cybersecurity threat?",
    "How much does security cost?",
    "What is AI cybersecurity?",
    "Need SOC2 compliance help"
  ];
  
  const sampleContainer = document.createElement("div");
  sampleContainer.className = "sample-questions";
  sampleContainer.innerHTML = `
    <div class="sample-title">Common Questions:</div>
    ${samples.map(q => `<div class="sample-question">${q}</div>`).join('')}
  `;
  
  quickReplies.parentNode.insertBefore(sampleContainer, quickReplies.nextSibling);
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
  // Add some CSS for sample questions
  const style = document.createElement("style");
  style.textContent = `
    .sample-questions {
      padding: 10px 20px;
      background: #0f172a;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .sample-title {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .sample-question {
      display: inline-block;
      background: rgba(255,255,255,0.05);
      padding: 6px 12px;
      margin: 4px;
      border-radius: 15px;
      font-size: 12px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sample-question:hover {
      background: rgba(0,255,157,0.1);
      color: #00ff9d;
    }
  `;
  document.head.appendChild(style);
});
