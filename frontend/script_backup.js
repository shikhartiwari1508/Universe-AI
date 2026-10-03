/* =========================================================
   UNIVERSE AI - CHAT CLIENT
   ChatGPT-style multi-chat session management
   ========================================================= */

const THEME_KEY = "nova_ai_theme";
const SETTINGS_KEY = "nova_ai_settings";
const CURRENT_CHAT_KEY = "universe_ai_current_chat";

let chats = [];
let currentChatId = null;
let conversation = [];
let isGenerating = false;
let selectedFile = null;
let recognition = null;
let searchTerm = "";

/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatHistory = document.getElementById("chatHistory");
const clearChatsBtn = document.getElementById("clearChatsBtn");
const searchInput = document.getElementById("searchInput");
const fileInput = document.getElementById("fileInput");
const attachBtn = document.getElementById("attachBtn");
const voiceBtn = document.getElementById("voiceBtn");
const themeToggle = document.getElementById("themeToggle");
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const overlay = document.getElementById("overlay");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const charCounter = document.getElementById("charCounter");


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    loadTheme();
    loadSettings();

    setupEventListeners();
    setupPromptCards();
    setupVoiceRecognition();
    updateCharacterCounter();

    await initializeChatSystem();
});


async function initializeChatSystem() {
    try {
        await loadChats();

        const savedChatId = localStorage.getItem(CURRENT_CHAT_KEY);

        if (savedChatId && chats.some(chat => chat.id === savedChatId)) {
            await openChat(savedChatId);
        } else if (chats.length > 0) {
            await openChat(chats[0].id);
        } else {
            await createNewChat(false);
        }
    } catch (error) {
        console.error("Chat initialization error:", error);

        currentChatId = null;
        conversation = [];

        clearMessages();
        showWelcome();
    }
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {

    /* Send */
    if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
    }

    /* Enter / Shift + Enter */
    if (input) {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });

        input.addEventListener("input", updateCharacterCounter);
    }

    /* New Chat */
    if (newChatBtn) {
        newChatBtn.addEventListener("click", () => createNewChat(true));
    }

    /* Clear current chat */
    if (clearChatsBtn) {
        clearChatsBtn.addEventListener("click", clearCurrentChat);
    }

    /* Search */
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchTerm = searchInput.value.trim().toLowerCase();
            renderChatList();
        });
    }

    /* Attachment */
    if (attachBtn && fileInput) {
        attachBtn.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", handleFileSelection);
    }

    /* Voice */
    if (voiceBtn) {
        voiceBtn.addEventListener("click", toggleVoiceRecognition);
    }

    /* Theme */
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }

    /* Settings */
    if (settingsBtn) {
        settingsBtn.addEventListener("click", openSettings);
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener("click", closeSettings);
    }

    if (overlay) {
        overlay.addEventListener("click", closeSettings);
    }

    /* Mobile menu */
    if (menuBtn) {
        menuBtn.addEventListener("click", toggleSidebar);
    }

    /* Fullscreen */
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", toggleFullscreen);
    }
}


/* =========================================================
   CHAT API
   ========================================================= */

async function loadChats() {
    const response = await fetch("/api/chats");

    if (!response.ok) {
        throw new Error("Unable to load chats.");
    }

    const data = await response.json();

    chats = data.chats || [];

    renderChatList();
}


async function createNewChat(showToastMessage = true) {

    if (isGenerating) {
        showToast("Please wait until the current response finishes.");
        return;
    }

    try {

        const response = await fetch("/api/chats", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: "New Conversation"
            })
        });

        if (!response.ok) {
            throw new Error("Unable to create new chat.");
        }

        const chat = await response.json();

        chats = [
            chat,
            ...chats.filter(item => item.id !== chat.id)
        ];

        currentChatId = chat.id;

        localStorage.setItem(
            CURRENT_CHAT_KEY,
            currentChatId
        );

        conversation = [];

        clearMessages();
        showWelcome();

        renderChatList();

        if (showToastMessage) {
            showToast("New chat started");
        }

        closeMobileSidebar();

    } catch (error) {
        console.error(error);
        showToast("Could not create a new chat.");
    }
}


async function openChat(chatId) {

    if (!chatId) return;

    if (isGenerating) {
        showToast("Please wait until the current response finishes.");
        return;
    }

    try {

        const response = await fetch(
            `/api/chats/${encodeURIComponent(chatId)}/messages`
        );

        if (!response.ok) {
            throw new Error("Unable to open chat.");
        }

        const data = await response.json();

        currentChatId = chatId;

        localStorage.setItem(
            CURRENT_CHAT_KEY,
            currentChatId
        );

        conversation = [];

        clearMessages();

        const chatMessages = data.messages || [];

        if (chatMessages.length === 0) {
            showWelcome();
        } else {

            hideWelcome();

            chatMessages.forEach(message => {

                const item = {
                    role: message.role,
                    text: message.content,
                    time: message.created_at || getTime()
                };

                conversation.push(item);

                renderMessage(
                    item.role,
                    item.text,
                    item.time,
                    false
                );
            });
        }

        renderChatList();
        scrollToBottom();

        closeMobileSidebar();

    } catch (error) {

        console.error(error);

        showToast("Could not open this conversation.");
    }
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    if (isGenerating) return;

    if (!input) return;

    const text = input.value.trim();

    if (!text && !selectedFile) {
        return;
    }

    try {

        /* Create a chat automatically if none exists */
        if (!currentChatId) {
            await createNewChat(false);
        }

        let messageText = text;

        if (selectedFile) {

            if (messageText) {
                messageText += `\n\n[Attached file: ${selectedFile.name}]`;
            } else {
                messageText = `[Attached file: ${selectedFile.name}]`;
            }
        }

        /* Clear input */
        input.value = "";

        updateCharacterCounter();

        hideWelcome();

        /* Show user message immediately */
        const userMessage = {
            role: "user",
            text: messageText,
            time: getTime()
        };

        conversation.push(userMessage);

        renderMessage(
            "user",
            messageText,
            userMessage.time,
            true
        );

        scrollToBottom();

        const sessionId = currentChatId;

        /* Reset attachment UI */
        const uploadedFile = selectedFile;
        selectedFile = null;

        if (fileInput) {
            fileInput.value = "";
        }

        updateAttachmentUI();

        /* Disable generation state */
        isGenerating = true;
        setSendButtonState(true);

        showTyping();

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: messageText,
                session_id: sessionId
            })
        });

        if (!response.ok) {

            let errorMessage = "Something went wrong.";

            try {
                const errorData = await response.json();

                if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch (_) {}

            throw new Error(errorMessage);
        }

        hideTyping();

        /*
         * Create assistant message container first,
         * then stream response into it.
         */
        const assistantElement = createStreamingAssistantMessage();

        let assistantText = "";

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {

            const { value, done } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value, {
                stream: true
            });

            assistantText += chunk;

            updateStreamingMessage(
                assistantElement,
                assistantText
            );

            scrollToBottom();
        }

        /* Final assistant message */
        if (!assistantText.trim()) {
            assistantText = "I couldn't generate a response.";
        }

        const assistantMessage = {
            role: "assistant",
            text: assistantText,
            time: getTime()
        };

        conversation.push(assistantMessage);

        finalizeStreamingMessage(
            assistantElement,
            assistantText
        );

        /* Refresh sidebar because title/order may have changed */
        await loadChats();

        /*
         * Keep the current chat highlighted.
         */
        highlightCurrentChat();

    } catch (error) {

        console.error("Send message error:", error);

        hideTyping();

        /*
         * If request failed, show error message.
         */
        renderMessage(
            "assistant",
            `⚠️ ${error.message || "Unable to connect to Universe AI."}`,
            getTime(),
            true
        );

    } finally {

        isGenerating = false;

        setSendButtonState(false);

        scrollToBottom();
    }
}


/* =========================================================
   MESSAGE RENDERING
   ========================================================= */

function renderMessage(role, text, time = getTime(), animate = true) {

    if (!messages) return;

    hideWelcome();

    const wrapper = document.createElement("div");

    wrapper.className = `message-wrapper ${role}-message`;

    if (animate) {
        wrapper.classList.add("message-animate");
    }

    const avatar = document.createElement("div");

    avatar.className = "message-avatar";

    if (role === "user") {
        avatar.textContent = "You";
    } else {
        avatar.textContent = "AI";
    }

    const content = document.createElement("div");

    content.className = "message-content";

    const bubble = document.createElement("div");

    bubble.className = "message-bubble";

    if (role === "assistant") {
        bubble.innerHTML = formatAIResponse(text);
    } else {
        bubble.textContent = text;
    }

    const footer = document.createElement("div");

    footer.className = "message-footer";

    const timeElement = document.createElement("span");

    timeElement.className = "message-time";

    timeElement.textContent = time || getTime();

    footer.appendChild(timeElement);

    if (role === "assistant") {

        const actions = createMessageActions(text);

        actions.forEach(action => {
            footer.appendChild(action);
        });
    }

    content.appendChild(bubble);
    content.appendChild(footer);

    wrapper.appendChild(avatar);
    wrapper.appendChild(content);

    messages.appendChild(wrapper);

    return wrapper;
}


function createStreamingAssistantMessage() {

    if (!messages) return null;

    hideWelcome();

    const wrapper = document.createElement("div");

    wrapper.className = "message-wrapper assistant-message message-animate";

    const avatar = document.createElement("div");

    avatar.className = "message-avatar";
    avatar.textContent = "AI";

    const content = document.createElement("div");

    content.className = "message-content";

    const bubble = document.createElement("div");

    bubble.className = "message-bubble streaming-bubble";

    bubble.innerHTML = "";

    content.appendChild(bubble);

    wrapper.appendChild(avatar);
    wrapper.appendChild(content);

    messages.appendChild(wrapper);

    return {
        wrapper,
        bubble,
        content
    };
}


function updateStreamingMessage(element, text) {

    if (!element || !element.bubble) return;

    element.bubble.innerHTML = formatAIResponse(text);
}


function finalizeStreamingMessage(element, text) {

    if (!element || !element.bubble) return;

    element.bubble.classList.remove("streaming-bubble");

    element.bubble.innerHTML = formatAIResponse(text);

    const footer = document.createElement("div");

    footer.className = "message-footer";

    const timeElement = document.createElement("span");

    timeElement.className = "message-time";

    timeElement.textContent = getTime();

    footer.appendChild(timeElement);

    createMessageActions(text).forEach(action => {
        footer.appendChild(action);
    });

    element.content.appendChild(footer);
}


function createMessageActions(text) {

    const actions = [];

    const copyButton = document.createElement("button");

    copyButton.className = "message-action";

    copyButton.type = "button";

    copyButton.innerHTML = "⧉";

    copyButton.title = "Copy";

    copyButton.addEventListener("click", () => {
        copyText(text);
    });

    actions.push(copyButton);

    const speakButton = document.createElement("button");

    speakButton.className = "message-action";

    speakButton.type = "button";

    speakButton.innerHTML = "🔊";

    speakButton.title = "Read aloud";

    speakButton.addEventListener("click", () => {
        speakText(text);
    });

    actions.push(speakButton);

    return actions;
}


/* =========================================================
   AI RESPONSE FORMATTER
   ========================================================= */

function formatAIResponse(text) {

    if (!text) return "";

    let escaped = escapeHTML(text);

    /*
     * Code blocks
     */
    escaped = escaped.replace(
        /```([\w+-]*)\n?([\s\S]*?)```/g,
        (match, language, code) => {

            const lang = language || "code";

            return `
                <div class="code-block">
                    <div class="code-header">
                        <span>${lang}</span>
                        <button
                            type="button"
                            class="code-copy"
                            onclick="copyText(this.closest('.code-block').querySelector('code').innerText)"
                        >
                            Copy
                        </button>
                    </div>
                    <pre><code>${code.trim()}</code></pre>
                </div>
            `;
        }
    );

    /*
     * Inline code
     */
    escaped = escaped.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
    );

    /*
     * Bold
     */
    escaped = escaped.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    /*
     * Italic
     */
    escaped = escaped.replace(
        /\*(.*?)\*/g,
        "<em>$1</em>"
    );

    /*
     * Links
     */
    escaped = escaped.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    /*
     * Headings
     */
    escaped = escaped.replace(
        /^### (.*)$/gm,
        "<h4>$1</h4>"
    );

    escaped = escaped.replace(
        /^## (.*)$/gm,
        "<h3>$1</h3>"
    );

    escaped = escaped.replace(
        /^# (.*)$/gm,
        "<h2>$1</h2>"
    );

    /*
     * Unordered lists
     */
    escaped = escaped.replace(
        /^[•*-]\s+(.*)$/gm,
        "<li>$1</li>"
    );

    escaped = escaped.replace(
        /(<li>.*<\/li>)/gs,
        "<ul>$1</ul>"
    );

    /*
     * Numbered lists
     */
    escaped = escaped.replace(
        /^\d+\.\s+(.*)$/gm,
        "<li>$1</li>"
    );

    /*
     * New lines
     */
    escaped = escaped.replace(
        /\n/g,
        "<br>"
    );

    return escaped;
}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================================================
   CHAT LIST / HISTORY
   ========================================================= */

function renderChatList() {

    if (!chatHistory) return;

    chatHistory.innerHTML = "";

    let visibleChats = chats;

    if (searchTerm) {

        visibleChats = chats.filter(chat =>
            String(chat.title || "")
                .toLowerCase()
                .includes(searchTerm)
        );
    }

    if (!visibleChats.length) {

        const empty = document.createElement("div");

        empty.className = "history-empty";

        empty.textContent = searchTerm
            ? "No chats found"
            : "No conversations yet";

        chatHistory.appendChild(empty);

        return;
    }

    visibleChats.forEach(chat => {

        const item = document.createElement("div");

        item.className = "history-item";

        if (chat.id === currentChatId) {
            item.classList.add("active");
        }

        item.dataset.chatId = chat.id;

        const title = document.createElement("span");

        title.className = "history-title";

        title.textContent =
            chat.title || "New Conversation";

        item.appendChild(title);

        /*
         * Delete button
         */
        const deleteButton = document.createElement("button");

        deleteButton.className = "history-delete";

        deleteButton.type = "button";

        deleteButton.innerHTML = "×";

        deleteButton.title = "Delete chat";

        deleteButton.addEventListener("click", async (event) => {

            event.stopPropagation();

            await deleteChat(chat.id);
        });

        item.appendChild(deleteButton);

        /*
         * Open chat
         */
        item.addEventListener("click", () => {
            openChat(chat.id);
        });

        chatHistory.appendChild(item);
    });

    highlightCurrentChat();
}


function highlightCurrentChat() {

    if (!chatHistory) return;

    chatHistory
        .querySelectorAll(".history-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.chatId === currentChatId
            );
        });
}


/* =========================================================
   DELETE CHAT
   ========================================================= */

async function deleteChat(chatId) {

    if (!chatId) return;

    if (isGenerating) {
        showToast("Please wait until the current response finishes.");
        return;
    }

    const chat = chats.find(item => item.id === chatId);

    const title = chat?.title || "this chat";

    const confirmed = confirm(
        `Delete "${title}"?\n\nThis conversation will be permanently deleted.`
    );

    if (!confirmed) return;

    try {

        const response = await fetch(
            `/api/chats/${encodeURIComponent(chatId)}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Could not delete chat.");
        }

        chats = chats.filter(
            chat => chat.id !== chatId
        );

        /*
         * If deleting current chat
         */
        if (currentChatId === chatId) {

            currentChatId = null;

            localStorage.removeItem(
                CURRENT_CHAT_KEY
            );

            conversation = [];

            clearMessages();

            if (chats.length > 0) {
                await openChat(chats[0].id);
            } else {
                await createNewChat(false);
            }

        } else {

            renderChatList();
        }

        showToast("Chat deleted.");

    } catch (error) {

        console.error(error);

        showToast("Could not delete the chat.");
    }
}


/* =========================================================
   CLEAR CURRENT CHAT
   ========================================================= */

async function clearCurrentChat() {

    if (!currentChatId) {
        showToast("There is no active chat.");
        return;
    }

    await deleteChat(currentChatId);
}


/* =========================================================
   UI HELPERS
   ========================================================= */

function clearMessages() {

    if (!messages) return;

    messages.innerHTML = "";
}


function showWelcome() {

    if (welcome) {
        welcome.classList.remove("hidden");
    }
}


function hideWelcome() {

    if (welcome) {
        welcome.classList.add("hidden");
    }
}


function scrollToBottom() {

    if (!messages) return;

    requestAnimationFrame(() => {
        messages.scrollTop = messages.scrollHeight;
    });
}


function showTyping() {

    hideExistingTyping();

    if (!messages) return;

    const typing = document.createElement("div");

    typing.className = "typing-indicator";

    typing.id = "typingIndicator";

    typing.innerHTML = `
        <div class="typing-avatar">AI</div>
        <div class="typing-content">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    messages.appendChild(typing);

    scrollToBottom();
}


function hideTyping() {
    hideExistingTyping();
}


function hideExistingTyping() {

    const existing =
        document.getElementById("typingIndicator");

    if (existing) {
        existing.remove();
    }
}


function setSendButtonState(disabled) {

    if (!sendBtn) return;

    sendBtn.disabled = disabled;

    sendBtn.classList.toggle(
        "loading",
        disabled
    );
}


function updateCharacterCounter() {

    if (!input || !charCounter) return;

    const length = input.value.length;

    charCounter.textContent = `${length}`;

    if (length > 4000) {
        charCounter.classList.add("warning");
    } else {
        charCounter.classList.remove("warning");
    }
}


/* =========================================================
   PROMPT CARDS
   ========================================================= */

function setupPromptCards() {

    const cards =
        document.querySelectorAll(
            ".prompt-card, .suggestion-card, [data-prompt]"
        );

    cards.forEach(card => {

        card.addEventListener("click", () => {

            const prompt =
                card.dataset.prompt ||
                card.textContent.trim();

            if (!prompt || !input) return;

            input.value = prompt;

            updateCharacterCounter();

            input.focus();
        });
    });
}


/* =========================================================
   FILE ATTACHMENT UI
   ========================================================= */

function handleFileSelection(event) {

    const file =
        event.target.files?.[0];

    if (!file) return;

    selectedFile = file;

    updateAttachmentUI();

    showToast(
        `Attached: ${file.name}`
    );
}


function updateAttachmentUI() {

    const existing =
        document.getElementById("selectedFileInfo");

    if (existing) {
        existing.remove();
    }

    if (!selectedFile || !input) return;

    const info = document.createElement("div");

    info.id = "selectedFileInfo";

    info.className = "selected-file-info";

    info.innerHTML = `
        <span>📎 ${escapeHTML(selectedFile.name)}</span>
        <button type="button" id="removeSelectedFile">×</button>
    `;

    input.parentElement?.appendChild(info);

    const removeButton =
        document.getElementById(
            "removeSelectedFile"
        );

    if (removeButton) {

        removeButton.addEventListener(
            "click",
            () => {

                selectedFile = null;

                if (fileInput) {
                    fileInput.value = "";
                }

                updateAttachmentUI();
            }
        );
    }
}


/* =========================================================
   VOICE RECOGNITION
   ========================================================= */

function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        if (voiceBtn) {
            voiceBtn.disabled = true;
            voiceBtn.title =
                "Voice input is not supported in this browser.";
        }

        return;
    }

    recognition =
        new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.onstart = () => {

        if (voiceBtn) {
            voiceBtn.classList.add("recording");
        }

        showToast("Listening...");
    };

    recognition.onresult = event => {

        let transcript = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {
            transcript +=
                event.results[i][0].transcript;
        }

        if (input) {
            input.value = transcript;
            updateCharacterCounter();
        }
    };

    recognition.onerror = event => {

        console.error(
            "Speech recognition error:",
            event.error
        );

        showToast("Voice input error.");
    };

    recognition.onend = () => {

        if (voiceBtn) {
            voiceBtn.classList.remove(
                "recording"
            );
        }
    };
}


function toggleVoiceRecognition() {

    if (!recognition) {
        showToast(
            "Voice input is not supported."
        );

        return;
    }

    try {

        recognition.start();

    } catch (error) {

        try {
            recognition.stop();
        } catch (_) {}
    }
}


/* =========================================================
   COPY / SPEAK
   ========================================================= */

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        showToast("Copied to clipboard.");

    } catch (error) {

        const textarea =
            document.createElement("textarea");

        textarea.value = text;

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        showToast("Copied to clipboard.");
    }
}


function speakText(text) {

    if (!("speechSynthesis" in window)) {
        showToast(
            "Speech synthesis is not supported."
        );
        return;
    }

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = "en-IN";

    utterance.rate = 1;

    utterance.pitch = 1;

    window.speechSynthesis.speak(
        utterance
    );

    showToast("Universe AI is speaking.");
}


/* =========================================================
   THEME
   ========================================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        ) || "dark";

    document.documentElement.dataset.theme =
        theme;

    document.body.classList.toggle(
        "light-theme",
        theme === "light"
    );
}


function toggleTheme() {

    const current =
        localStorage.getItem(
            THEME_KEY
        ) || "dark";

    const next =
        current === "dark"
            ? "light"
            : "dark";

    localStorage.setItem(
        THEME_KEY,
        next
    );

    loadTheme();
}


/* =========================================================
   SETTINGS
   ========================================================= */

function loadSettings() {

    try {

        const saved =
            localStorage.getItem(
                SETTINGS_KEY
            );

        if (!saved) return;

        const settings =
            JSON.parse(saved);

        if (
            settings.sound === false
        ) {
            document.body.dataset.sound =
                "off";
        }

    } catch (error) {

        console.error(
            "Settings load error:",
            error
        );
    }
}


function saveSettings(settings) {

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );
}


function openSettings() {

    if (settingsPanel) {
        settingsPanel.classList.add(
            "open"
        );
    }

    if (overlay) {
        overlay.classList.add(
            "active"
        );
    }
}


function closeSettings() {

    if (settingsPanel) {
        settingsPanel.classList.remove(
            "open"
        );
    }

    if (overlay) {
        overlay.classList.remove(
            "active"
        );
    }
}


/* =========================================================
   SIDEBAR
   ========================================================= */

function toggleSidebar() {

    if (!sidebar) return;

    sidebar.classList.toggle("open");
}


function closeMobileSidebar() {

    if (!sidebar) return;

    sidebar.classList.remove("open");
}


/* =========================================================
   FULLSCREEN
   ========================================================= */

async function toggleFullscreen() {

    try {

        if (!document.fullscreenElement) {

            await document.documentElement
                .requestFullscreen();

        } else {

            await document.exitFullscreen();
        }

    } catch (error) {

        console.error(
            "Fullscreen error:",
            error
        );
    }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    let toast =
        document.getElementById(
            "universeToast"
        );

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "universeToast";

        toast.className =
            "universe-toast";

        document.body.appendChild(
            toast
        );
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(
        toast._timeout
    );

    toast._timeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);
}


/* =========================================================
   TIME
   ========================================================= */

function getTime() {

    return new Date().toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /* Ctrl + K = Search */
        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            if (searchInput) {
                searchInput.focus();
            }
        }

        /* Ctrl + Shift + O = New Chat */
        if (
            event.ctrlKey &&
            event.shiftKey &&
            event.key.toLowerCase() === "o"
        ) {

            event.preventDefault();

            createNewChat(true);
        }

        /* Escape = close settings/sidebar */
        if (event.key === "Escape") {

            closeSettings();
            closeMobileSidebar();
        }
    }
);


/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.copyText = copyText;
window.speakText = speakText;
window.openChat = openChat;
window.createNewChat = createNewChat;
window.deleteChat = deleteChat;