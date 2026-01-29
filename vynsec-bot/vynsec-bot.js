// FIXED VynSec Bot - Better Conversation Flow
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
        riskScore: 0,
        isProcessing: false
    };
    
    // Conversation steps
    const conversationFlow = [
        {
            type: 'greeting',
            message: "👋 Hello! I'm your AI Cybersecurity Assistant from <strong>VynSec</strong>.",
            delay: 1000,
            replies: []
        },
        {
            type: 'intro',
            message: "I can assess your security posture in under 60 seconds and provide personalized recommendations.",
            delay: 800,
            replies: []
        },
        {
            type: 'question',
            message: "Would you like to begin a security assessment?",
            delay: 800,
            replies: ['Yes, start assessment', 'Learn about VynSec', 'Maybe later']
        }
    ];
    
    // Auto-open after 3 seconds
    setTimeout(() => {
        openChat();
        // Start conversation with delays
        startConversation();
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
        if (e.target.classList.contains('quick-reply-btn') && !session.isProcessing) {
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
    
    function startConversation() {
        session.isProcessing = true;
        quickReplies.innerHTML = '';
        
        let delay = 500;
        
        conversationFlow.forEach((step, index) => {
            setTimeout(() => {
                if (step.type === 'greeting' || step.type === 'intro') {
                    botMessage(step.message, false);
                    
                    // If this is the last message, show quick replies
                    if (index === conversationFlow.length - 1) {
                        setTimeout(() => {
                            session.isProcessing = false;
                            if (step.replies.length > 0) {
                                showQuickReplies(step.replies);
                            }
                        }, 800);
                    }
                } else if (step.type === 'question') {
                    botMessage(step.message, true);
                    setTimeout(() => {
                        session.isProcessing = false;
                        showQuickReplies(step.replies);
                    }, 800);
                }
            }, delay);
            
            delay += step.delay + 800; // Add delay between messages
        });
    }
    
    function botMessage(text, showTyping = true) {
        if (showTyping) {
            showTypingIndicator();
        }
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setTimeout(() => {
            if (showTyping) {
                removeTypingIndicator();
            }
            
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
        }, showTyping ? 1000 : 0);
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
        if (session.isProcessing) return;
        
        const text = userInput.value.trim();
        if (!text) return;
        
        session.isProcessing = true;
        userMessage(text);
        userInput.value = '';
        quickReplies.innerHTML = '';
        
        // Handle user input based on current step
        handleUserInput(text);
    }
    
    function handleUserReply(reply) {
        if (session.isProcessing) return;
        
        session.isProcessing = true;
        userMessage(reply);
        quickReplies.innerHTML = '';
        
        // Handle different replies
        handleUserInput(reply);
    }
    
    function handleUserInput(input) {
        if (session.step === 0) {
            if (input.includes('Yes, start assessment') || input.toLowerCase().includes('yes')) {
                session.step = 1;
                setTimeout(() => {
                    botMessage("Great! Let's begin the security assessment.");
                    setTimeout(() => {
                        botMessage("What type of system do you need to secure?");
                        showQuickReplies(['SaaS Application', 'eCommerce Platform', 'Corporate Website', 'Mobile App', 'Other']);
                        session.isProcessing = false;
                    }, 800);
                }, 800);
            } else if (input.includes('Learn about VynSec')) {
                botMessage("VynSec provides AI-driven cybersecurity solutions including:");
                setTimeout(() => {
                    botMessage("• Threat Detection & Response<br>• Vulnerability Management<br>• Compliance Automation<br>• Security Awareness Training");
                    setTimeout(() => {
                        botMessage("Want to see how we can protect your business?");
                        showQuickReplies(['Yes, Show Solutions', 'Start Assessment', 'Talk to Human']);
                        session.isProcessing = false;
                    }, 1000);
                }, 800);
            } else if (input.includes('Maybe later')) {
                botMessage("No problem! I'll be here when you're ready.");
                setTimeout(() => {
                    showQuickReplies(['Start Assessment Now', 'Contact Sales']);
                    session.isProcessing = false;
                }, 800);
            }
        } else if (session.step === 1) {
            // User selected system type
            userMessage(input);
            setTimeout(() => {
                botMessage("Do users create accounts or log into your system?");
                showQuickReplies(['Yes', 'No', 'Not Applicable']);
                session.step = 2;
                session.isProcessing = false;
            }, 800);
        } else if (session.step === 2) {
            userMessage(input);
            setTimeout(() => {
                botMessage("Do you process online payments or handle sensitive financial data?");
                showQuickReplies(['Yes, we process payments', 'We handle financial data', 'No financial data']);
                session.step = 3;
                session.isProcessing = false;
            }, 800);
        } else if (session.step === 3) {
            userMessage(input);
            setTimeout(() => {
                botMessage("Do you need to comply with regulations like ISO 27001, SOC2, GDPR, or HIPAA?");
                showQuickReplies(['Yes, we need compliance', 'Not sure', 'No compliance needed']);
                session.step = 4;
                session.isProcessing = false;
            }, 800);
        } else if (session.step === 4) {
            userMessage(input);
            setTimeout(() => {
                // Show results
                const riskLevel = session.riskScore > 7 ? "High" : session.riskScore > 4 ? "Medium" : "Low";
                botMessage(`🔐 <strong>Security Assessment Complete</strong><br><br>
                    Your risk level: <strong>${riskLevel}</strong><br><br>
                    Enter your work email to receive a detailed security report:`);
                session.step = 5;
                session.isProcessing = false;
            }, 800);
        } else if (session.step === 5) {
            // Email collection
            userMessage(input);
            if (validateEmail(input)) {
                setTimeout(() => {
                    botMessage("Thank you! Your security report will be sent to your email.");
                    setTimeout(() => {
                        botMessage("Would you like to schedule a free consultation with our security experts?");
                        showQuickReplies(['Yes, schedule call', 'No, thanks', 'Send report first']);
                        session.isProcessing = false;
                    }, 800);
                }, 800);
            } else {
                botMessage("Please enter a valid email address:");
                session.isProcessing = false;
            }
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
    
    function removeTypingIndicator() {
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    console.log('VynSec Bot loaded successfully!');
});
