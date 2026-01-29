// SIMPLE VynSec Bot - Working Version
document.addEventListener('DOMContentLoaded', function() {
    console.log('VynSec Bot loading...');
    
    // Get DOM elements
    const widget = document.getElementById('vynsec-chat-widget');
    const chatToggle = document.getElementById('vynsec-chat-toggle');
    const closeBtn = document.querySelector('.close-btn');
    const minimizeBtn = document.querySelector('.minimize-btn');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const quickReplies = document.getElementById('quickReplies');
    
    // Bot state
    let session = {
        step: 0,
        riskScore: 0
    };
    
    // Auto-open after 3 seconds
    setTimeout(() => {
        openChat();
        // Show first message
        setTimeout(() => {
            botMessage("👋 Hello! I'm your AI Cybersecurity Assistant from <strong>VynSec</strong>.");
            setTimeout(() => {
                botMessage("I can assess your security posture in under 60 seconds and provide personalized recommendations.");
                setTimeout(() => {
                    botMessage("Would you like to begin a security assessment?");
                    showQuickReplies(['Yes, start assessment', 'Learn about VynSec', 'Maybe later']);
                }, 800);
            }, 800);
        }, 500);
    }, 3000);
    
    // Event Listeners
    chatToggle.addEventListener('click', openChat);
    closeBtn.addEventListener('click', closeChat);
    minimizeBtn.addEventListener('click', minimizeChat);
    sendBtn.addEventListener('click', sendUserMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });
    
    // Quick reply handlers
    quickReplies.addEventListener('click', function(e) {
        if (e.target.classList.contains('quick-reply-btn')) {
            const reply = e.target.textContent;
            handleUserReply(reply);
        }
    });
    
    // Functions
    function openChat() {
        widget.classList.remove('hidden');
        userInput.focus();
    }
    
    function closeChat() {
        widget.classList.add('hidden');
    }
    
    function minimizeChat() {
        alert('Minimize feature coming soon!');
    }
    
    function botMessage(text) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="bot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-text">
                    <div class="message-sender">VynSec AI</div>
                    ${text}
                </div>
            </div>
            <div class="message-time">${time}</div>
        `;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    function userMessage(text) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">
                    <div class="message-sender">You</div>
                    ${text}
                </div>
            </div>
            <div class="message-time">${time}</div>
        `;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    function sendUserMessage() {
        const text = userInput.value.trim();
        if (!text) return;
        
        userMessage(text);
        userInput.value = '';
        
        // Simple bot response logic
        setTimeout(() => {
            if (session.step === 0) {
                botMessage("Great! Let's start with your security assessment.");
                session.step++;
                setTimeout(() => {
                    botMessage("What type of system do you need to secure?");
                    showQuickReplies(['SaaS Application', 'eCommerce Platform', 'Corporate Website', 'Mobile App']);
                }, 800);
            } else if (session.step === 1) {
                botMessage("Do users create accounts or log into your system?");
                session.step++;
                showQuickReplies(['Yes', 'No', 'Not Applicable']);
            }
            // Add more steps as needed
        }, 1000);
    }
    
    function handleUserReply(reply) {
        userMessage(reply);
        quickReplies.innerHTML = '';
        
        // Handle different replies
        if (reply.includes('Yes, start assessment')) {
            session.step = 1;
            setTimeout(() => {
                botMessage("Great! Let's begin.");
                setTimeout(() => {
                    botMessage("What type of system do you need to secure?");
                    showQuickReplies(['SaaS Application', 'eCommerce Platform', 'Corporate Website', 'Mobile App']);
                }, 800);
            }, 800);
        } else if (reply.includes('Learn about VynSec')) {
            botMessage("VynSec provides AI-driven cybersecurity solutions including:");
            setTimeout(() => {
                botMessage("• Threat Detection & Response<br>• Vulnerability Management<br>• Compliance Automation<br>• Security Awareness Training");
                setTimeout(() => {
                    botMessage("Want to see how we can protect your business?");
                    showQuickReplies(['Yes, Show Solutions', 'Start Assessment', 'Talk to Human']);
                }, 1000);
            }, 800);
        } else if (reply.includes('Maybe later')) {
            botMessage("No problem! I'll be here when you're ready.");
            showQuickReplies(['Start Assessment Now', 'Contact Sales']);
        }
    }
    
    function showQuickReplies(options) {
        quickReplies.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'quick-reply-btn';
            button.textContent = option;
            quickReplies.appendChild(button);
        });
    }
    
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        typingDiv.id = 'typingIndicator';
        chatBox.appendChild(typingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    console.log('VynSec Bot loaded successfully!');
});
