/* =========================================================

   UNIVERSE AI — FRONTEND ENGINE

   FastAPI + Ollama

   Real-time streaming enabled

========================================================= */


/* ================= ELEMENTS ================= */


const messages = document.getElementById("messages");

const messageInput = document.getElementById("messageInput");

const sendBtn = document.getElementById("sendBtn");


const welcome = document.getElementById("welcome");

const typing = document.getElementById("typing");


const chatHistory = document.getElementById("chatHistory");


const newChatBtn = document.getElementById("newChatBtn");

const clearChatsBtn = document.getElementById("clearChatsBtn");


const themeBtn = document.getElementById("themeBtn");

const modalThemeBtn = document.getElementById("modalThemeBtn");


const settingsBtn = document.getElementById("settingsBtn");

const settingsModal = document.getElementById("settingsModal");


const closeSettings = document.getElementById("closeSettings");

const closeSettings2 = document.getElementById("closeSettings2");


const searchBtn = document.getElementById("searchBtn");

const searchPanel = document.getElementById("searchPanel");

const searchInput = document.getElementById("searchInput");

const closeSearch = document.getElementById("closeSearch");


const voiceBtn = document.getElementById("voiceBtn");


const attachBtn = document.getElementById("attachBtn");

const fileInput = document.getElementById("fileInput");


const fullscreenBtn = document.getElementById("fullscreenBtn");


const mobileMenu = document.getElementById("mobileMenu");

const sidebar = document.getElementById("sidebar");


const toast = document.getElementById("toast");


const messageCounter = document.getElementById("messageCounter");


const soundToggle = document.getElementById("soundToggle");

const enterToggle = document.getElementById("enterToggle");


/* ================= STORAGE ================= */


const STORAGE_KEY = "nova_ai_conversations";

const THEME_KEY = "nova_ai_theme";

const SETTINGS_KEY = "nova_ai_settings";

const SESSION_KEY = "nova_session_id";


/* ================= STATE ================= */


let conversation = [];

let isGenerating = false;


let recognition = null;

let isListening = false;


let toastTimer = null;


/* =========================================================

   INITIALIZATION

========================================================= */


document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    loadSettings();

    setupVoiceRecognition();

    setupPromptCards();

    loadConversation();

    autoResize();

    updateCounter();

});


/* =========================================================

   SESSION MANAGEMENT

========================================================= */


async function getSessionId() {

    let sessionId =
        localStorage.getItem(SESSION_KEY);


    /*
     * Existing session
     */


    if (sessionId) {

        return sessionId;

    }


    /*
     * Create new backend chat
     */


    const response =
        await fetch("/api/chats", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                title: "New Conversation"

            })

        });


    if (!response.ok) {

        throw new Error(
            "Could not create chat session"
        );

    }


    const data =
        await response.json();


    sessionId =
        data.id;


    localStorage.setItem(
        SESSION_KEY,
        sessionId
    );


    return sessionId;

}


/* =========================================================

   SEND MESSAGE — REAL TIME STREAMING

========================================================= */


async function sendMessage() {

    const text =
        messageInput.value.trim();


    if (
        !text ||
        isGenerating
    ) {

        return;

    }


    /* ================= USER MESSAGE ================= */


    addMessage(
        "user",
        text
    );


    messageInput.value = "";

    updateCounter();

    autoResize();


    welcome.classList.add(
        "hidden"
    );


    showTyping(true);

    isGenerating = true;

    sendBtn.disabled = true;


    try {


        /* ================= SESSION ================= */


        const sessionId =
            await getSessionId();


        /* ================= API REQUEST ================= */


        const response =
            await fetch(
                "/api/chat",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "text/plain"

                    },

                    body: JSON.stringify({

                        message: text,

                        session_id:
                            sessionId

                    })

                }
            );


        /* ================= ERROR ================= */


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(

                `Server error: ${response.status} ${errorText}`

            );

        }


        showTyping(false);


        /* =================================================
           CREATE EMPTY ASSISTANT MESSAGE
        ================================================= */


        const row =
            document.createElement("div");


        row.className =
            "message-row assistant";


        const avatar =
            document.createElement("div");


        avatar.className =
            "avatar";


        avatar.textContent =
            "✦";


        const content =
            document.createElement("div");


        content.className =
            "message-content";


        const bubble =
            document.createElement("div");


        bubble.className =
            "message-bubble";


        const time =
            document.createElement("div");


        time.className =
            "message-time";


        time.textContent =
            getTime();


        const tools =
            document.createElement("div");


        tools.className =
            "message-tools";


        content.appendChild(
            bubble
        );


        content.appendChild(
            time
        );


        content.appendChild(
            tools
        );


        row.appendChild(
            avatar
        );


        row.appendChild(
            content
        );


        messages.appendChild(
            row
        );


        /* =================================================
           REAL-TIME STREAM
        ================================================= */


        let reply = "";


        if (!response.body) {

            reply =
                await response.text();


            bubble.innerHTML =
                formatAIResponse(
                    reply
                );

        }

        else {

            const reader =
                response.body.getReader();


            const decoder =
                new TextDecoder();


            while (true) {

                const result =
                    await reader.read();


                if (result.done) {

                    break;

                }


                const chunk =
                    decoder.decode(

                        result.value,

                        {
                            stream: true
                        }

                    );


                /*
                 * Add new text immediately
                 */


                reply += chunk;


                /*
                 * Update bubble immediately
                 */


                bubble.innerHTML =
                    formatAIResponse(
                        reply
                    );


                /*
                 * Keep chat at bottom
                 */


                scrollToBottom();

            }


            /*
             * Decode remaining characters
             */


            const finalChunk =
                decoder.decode();


            if (finalChunk) {

                reply += finalChunk;

                bubble.innerHTML =
                    formatAIResponse(
                        reply
                    );

            }

        }


        /* ================= EMPTY RESPONSE ================= */


        if (!reply.trim()) {

            reply =
                "⚠️ AI ne koi response nahi diya.";


            bubble.innerHTML =
                formatAIResponse(
                    reply
                );

        }


        /* =================================================
           COPY BUTTON
        ================================================= */


        const copyButton =
            createToolButton(

                "⧉ Copy",

                () =>
                    copyText(reply)

            );


        tools.appendChild(
            copyButton
        );


        /* =================================================
           SPEAK BUTTON
        ================================================= */


        const speakButton =
            createToolButton(

                "🔊 Speak",

                () =>
                    speakText(reply)

            );


        tools.appendChild(
            speakButton
        );


        /* =================================================
           SAVE ASSISTANT MESSAGE
        ================================================= */


        conversation.push({

            role:
                "assistant",

            text:
                reply,

            time:
                getTime()

        });


        saveConversation();

        renderHistory();

        scrollToBottom();


        /* ================= SOUND ================= */


        if (
            soundToggle &&
            soundToggle.checked
        ) {

            playNotificationSound();

        }


    } catch (error) {

        console.error(
            "Chat Error:",
            error
        );


        showTyping(false);


        /*
         * UPDATED ERROR MESSAGE
         *
         * Old Ollama-specific message removed.
         * Now actual Render/Gemini/API error
         * will be displayed in the chat.
         */


        addMessage(

            "assistant",

            "❌ Error: " +
            (
                error.message ||
                "Something went wrong. Please try again."
            )

        );


    } finally {

        isGenerating = false;

        sendBtn.disabled = false;

        messageInput.focus();

    }

}


/* =========================================================

   ADD MESSAGE

========================================================= */


function addMessage(
    role,
    text
) {

    const row =
        document.createElement("div");


    row.className =
        `message-row ${role}`;


    const avatar =
        document.createElement("div");


    avatar.className =
        "avatar";


    avatar.textContent =

        role === "assistant"
            ? "✦"
            : "YOU";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const bubble =
        document.createElement("div");


    bubble.className =
        "message-bubble";


    if (
        role === "assistant"
    ) {

        bubble.innerHTML =
            formatAIResponse(text);

    }

    else {

        bubble.textContent =
            text;

    }


    const time =
        document.createElement("div");


    time.className =
        "message-time";


    time.textContent =
        getTime();


    content.appendChild(
        bubble
    );


    content.appendChild(
        time
    );


    row.appendChild(
        avatar
    );


    row.appendChild(
        content
    );


    messages.appendChild(
        row
    );


    scrollToBottom();

}

/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(
    role,
    text
) {

    const row =
        document.createElement("div");


    row.className =
        `message-row ${role}`;


    const avatar =
        document.createElement("div");


    avatar.className =
        "avatar";


    avatar.textContent =

        role === "assistant"
            ? "✦"
            : "YOU";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const bubble =
        document.createElement("div");


    bubble.className =
        "message-bubble";


    if (
        role === "assistant"
    ) {

        bubble.innerHTML =
            formatAIResponse(text);

    }

    else {

        bubble.textContent =
            text;

    }


    const time =
        document.createElement("div");


    time.className =
        "message-time";


    time.textContent =
        getTime();


    const tools =
        document.createElement("div");


    tools.className =
        "message-tools";


    /*
     * Copy
     */


    tools.appendChild(

        createToolButton(

            "⧉ Copy",

            () =>
                copyText(text)

        )

    );


    /*
     * Speak only for AI
     */


    if (
        role === "assistant"
    ) {

        tools.appendChild(

            createToolButton(

                "🔊 Speak",

                () =>
                    speakText(text)

            )

        );

    }


    content.appendChild(
        bubble
    );


    content.appendChild(
        time
    );


    content.appendChild(
        tools
    );


    row.appendChild(
        avatar
    );


    row.appendChild(
        content
    );


    messages.appendChild(
        row
    );


    /*
     * Save in local conversation
     */


    conversation.push({

        role:
            role,

        text:
            text,

        time:
            getTime()

    });


    saveConversation();

    renderHistory();

    scrollToBottom();

}


/* =========================================================
   FORMAT AI RESPONSE
========================================================= */

function formatAIResponse(text) {

    if (!text) {

        return "";

    }


    let escaped =
        escapeHTML(text);


    /*
     * Code blocks
     */


    escaped =
        escaped.replace(

            /```([\s\S]*?)```/g,

            (_, code) => {

                return `

                    <pre class="code-block">${code.trim()}</pre>

                `;

            }

        );


    /*
     * Inline code
     */


    escaped =
        escaped.replace(

            /`([^`]+)`/g,

            "<code>$1</code>"

        );


    /*
     * Bold
     */


    escaped =
        escaped.replace(

            /\*\*(.*?)\*\*/g,

            "<strong>$1</strong>"

        );


    /*
     * Italic
     */


    escaped =
        escaped.replace(

            /\*(.*?)\*/g,

            "<em>$1</em>"

        );


    /*
     * Line breaks
     */


    escaped =
        escaped.replace(

            /\n/g,

            "<br>"

        );


    return escaped;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================================
   CREATE TOOL BUTTON
========================================================= */

function createToolButton(
    label,
    callback
) {

    const button =
        document.createElement("button");


    button.className =
        "message-tool";


    button.textContent =
        label;


    button.addEventListener(
        "click",
        callback
    );


    return button;

}


/* =========================================================
   COPY TEXT
========================================================= */

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );


        showToast(
            "Copied to clipboard"
        );

    }

    catch (error) {

        console.error(
            "Copy Error:",
            error
        );


        showToast(
            "Unable to copy text"
        );

    }

}


/* =========================================================
   SPEAK TEXT
========================================================= */

function speakText(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        showToast(
            "Speech synthesis is not supported"
        );

        return;

    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.lang =
        "en-IN";


    utterance.rate =
        1;


    utterance.pitch =
        1;


    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   SHOW TYPING
========================================================= */

function showTyping(show) {

    if (!typing) {

        return;

    }


    if (show) {

        typing.classList.remove(
            "hidden"
        );

    }

    else {

        typing.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   SCROLL TO BOTTOM
========================================================= */

function scrollToBottom() {

    if (!messages) {

        return;

    }


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================================
   GET TIME
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
   FORMAT AI RESPONSE
========================================================= */

function formatAIResponse(text) {

    if (!text) {

        return "";

    }


    let escaped =
        escapeHTML(text);


    /* 
     * Code blocks
     */

    escaped =
        escaped.replace(

            /```([\s\S]*?)```/g,

            (_, code) => {

                return `
                    <pre class="code-block">${code.trim()}</pre>
                `;

            }

        );


    /*
     * Inline code
     */

    escaped =
        escaped.replace(

            /`([^`]+)`/g,

            `<code class="inline-code">$1</code>`

        );


    /*
     * Bold
     */

    escaped =
        escaped.replace(

            /\*\*(.*?)\*\*/g,

            "<strong>$1</strong>"

        );


    /*
     * Line breaks
     */

    escaped =
        escaped.replace(

            /\n/g,

            "<br>"

        );


    return escaped;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    return text

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   CREATE BUTTON
========================================================= */

function createToolButton(
    label,
    callback
) {

    const button =
        document.createElement("button");


    button.type =
        "button";


    button.textContent =
        label;


    button.addEventListener(
        "click",
        callback
    );


    return button;

}


/* =========================================================
   COPY TEXT
========================================================= */

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );


        showToast(
            "Copied to clipboard"
        );


    } catch {

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        document.body.appendChild(
            textarea
        );


        textarea.select();


        document.execCommand(
            "copy"
        );


        textarea.remove();


        showToast(
            "Copied to clipboard"
        );

    }

}


/* =========================================================
   TEXT TO SPEECH
========================================================= */

function speakText(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        showToast(
            "Speech is not supported"
        );

        return;

    }


    window.speechSynthesis.cancel();


    const cleanText =
        text

            .replace(
                /```[\s\S]*?```/g,
                ""
            )

            .replace(
                /[*#`]/g,
                ""
            );


    const speech =
        new SpeechSynthesisUtterance(
            cleanText
        );


    speech.rate =
        1;

    speech.pitch =
        1;

    speech.volume =
        1;


    window.speechSynthesis.speak(
        speech
    );


    showToast(
        "NOVA is speaking 🔊"
    );

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

            voiceBtn.title =
                "Voice input is not supported";

        }

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.onstart =
        () => {

            isListening =
                true;


                        voiceBtn.classList.add(
            "active"
        );


        showToast(
            "Listening... 🎙"
        );

    };


recognition.onresult =
    event => {

        const transcript =
            event
                .results[0][0]
                .transcript;


        messageInput.value +=

            (
                messageInput.value
                    ? " "
                    : ""
            ) +

            transcript;


        updateCounter();

        autoResize();

    };


recognition.onerror =
    () => {

        showToast(
            "Voice recognition failed"
        );

    };


recognition.onend =
    () => {

        isListening =
            false;


        voiceBtn.classList.remove(
            "active"
        );

    };

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

            voiceBtn.title =
                "Voice input is not supported";

        }

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.onstart =
        () => {

            isListening =
                true;


            voiceBtn.classList.add(
                "active"
            );


            showToast(
                "Listening... 🎙"
            );

        };


    recognition.onresult =
        event => {

            const transcript =
                event
                    .results[0][0]
                    .transcript;


            messageInput.value +=

                (
                    messageInput.value
                        ? " "
                        : ""
                ) +

                transcript;


            updateCounter();

            autoResize();

        };


    recognition.onerror =
        () => {

            showToast(
                "Voice recognition failed"
            );

        };


    recognition.onend =
        () => {

            isListening =
                false;


            voiceBtn.classList.remove(
                "active"
            );

        };

}

/* =========================================================
   VOICE BUTTON
========================================================= */

if (voiceBtn) {

    voiceBtn.addEventListener(

        "click",

        () => {

            if (!recognition) {

                showToast(
                    "Try Chrome or Edge for voice input"
                );

                return;
            }


            if (isListening) {

                recognition.stop();

            }

            else {

                recognition.start();

            }

        }

    );

}


/* =========================================================
   PROMPT CARDS
========================================================= */

function setupPromptCards() {

    document
        .querySelectorAll(".prompt-card")
        .forEach(card => {

            card.addEventListener(

                "click",

                () => {

                    messageInput.value =
                        card.dataset.prompt;


                    updateCounter();

                    autoResize();

                    messageInput.focus();

                }

            );

        });

}


/* =========================================================
   ENTER TO SEND
========================================================= */

messageInput.addEventListener(

    "keydown",

    event => {

        if (

            event.key === "Enter" &&

            !event.shiftKey &&

            enterToggle.checked

        ) {

            event.preventDefault();

            sendMessage();

        }

    }

);


/* =========================================================
   SEND BUTTON
========================================================= */

sendBtn.addEventListener(

    "click",

    sendMessage

);


/* =========================================================
   AUTO RESIZE
========================================================= */

function autoResize() {

    messageInput.style.height =
        "auto";


    messageInput.style.height =

        Math.min(

            messageInput.scrollHeight,

            150

        ) + "px";

}


messageInput.addEventListener(

    "input",

    () => {

        autoResize();

        updateCounter();

    }

);


/* =========================================================
   CHARACTER COUNTER
========================================================= */

function updateCounter() {

    if (!messageCounter) {

        return;

    }


    const count =
        messageInput.value.length;


    messageCounter.textContent =
        `${count} characters`;

}


/* =========================================================
   TYPING INDICATOR
========================================================= */

function showTyping(show) {

    if (!typing) {

        return;

    }


    typing.classList.toggle(

        "hidden",

        !show

    );


    if (show) {

        scrollToBottom();

    }

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
   SCROLL
========================================================= */

function scrollToBottom() {

    setTimeout(

        () => {

            const chatArea =
                document.getElementById(
                    "chatArea"
                );


            if (!chatArea) {

                return;

            }


            chatArea.scrollTo({

                top:
                    chatArea.scrollHeight,

                behavior:
                    "smooth"

            });

        },

        30

    );

}


/* =========================================================
   NEW CHAT
========================================================= */

if (newChatBtn) {

    newChatBtn.addEventListener(

        "click",

        newChat

    );

}


function newChat() {

    conversation = [];


    messages.innerHTML =
        "";


    welcome.classList.remove(
        "hidden"
    );


    /*
     * Remove backend session
     */

    localStorage.removeItem(
        SESSION_KEY
    );


    /*
     * Save empty local conversation
     */

    saveConversation();

    renderHistory();


    messageInput.value = "";

    updateCounter();

    autoResize();


    messageInput.focus();


    showToast(
        "New conversation started"
    );

}

/* =========================================================
   SAVE CONVERSATION
========================================================= */

function saveConversation() {

    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(
                conversation
            )

        );

    }

    catch (error) {

        console.error(

            "Could not save conversation",

            error

        );

    }

}


/* =========================================================
   LOAD CONVERSATION
========================================================= */

function loadConversation() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {

            renderHistory();

            return;

        }


        conversation =
            JSON.parse(saved);


        if (
            !Array.isArray(conversation)
        ) {

            conversation = [];

            return;

        }


        if (!conversation.length) {

            renderHistory();

            return;

        }


        welcome.classList.add(
            "hidden"
        );


        conversation.forEach(

            item => {

                renderSavedMessage(
                    item
                );

            }

        );


        renderHistory();

        scrollToBottom();


    }

    catch (error) {

        console.error(

            "Load conversation error:",

            error

        );


        conversation = [];

    }

}


/* =========================================================
   RENDER SAVED MESSAGE
========================================================= */

function renderSavedMessage(item) {

    const row =
        document.createElement("div");


    row.className =
        `message-row ${item.role}`;


    const avatar =
        document.createElement("div");


    avatar.className =
        "avatar";


    avatar.textContent =

        item.role === "assistant"

            ? "✦"

            : "YOU";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const bubble =
        document.createElement("div");


    bubble.className =
        "message-bubble";


    if (
        item.role === "assistant"
    ) {

        bubble.innerHTML =
            formatAIResponse(
                item.text
            );

    }

    else {

        bubble.textContent =
            item.text;

    }


    const time =
        document.createElement("div");


    time.className =
        "message-time";


    time.textContent =
        item.time || "";


    const tools =
        document.createElement("div");


    tools.className =
        "message-tools";


    /*
     * Copy
     */

    tools.appendChild(

        createToolButton(

            "⧉ Copy",

            () =>
                copyText(
                    item.text
                )

        )

    );


    /*
     * Speak
     */

    if (
        item.role === "assistant"
    ) {

        tools.appendChild(

            createToolButton(

                "🔊 Speak",

                () =>
                    speakText(
                        item.text
                    )

            )

        );

    }


    content.appendChild(
        bubble
    );

    content.appendChild(
        time
    );

    content.appendChild(
        tools
    );


    row.appendChild(
        avatar
    );

    row.appendChild(
        content
    );


    messages.appendChild(
        row
    );

}


/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {

    if (!chatHistory) {

        return;

    }


    chatHistory.innerHTML =
        "";


    if (!conversation.length) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "history-item";


        empty.textContent =
            "No conversations yet";


        chatHistory.appendChild(
            empty
        );


        return;

    }


    const userMessages =
        conversation.filter(

            item =>
                item.role === "user"

        );


    userMessages

        .slice(-10)

        .reverse()

        .forEach(item => {

            const history =
                document.createElement(
                    "div"
                );


            history.className =
                "history-item";


            history.textContent =
                item.text;


            history.title =
                item.text;


            history.addEventListener(

                "click",

                () => {

                    scrollToBottom();

                }

            );


            chatHistory.appendChild(
                history
            );

        });

}


/* =========================================================
   CLEAR CHAT
========================================================= */

if (clearChatsBtn) {

    clearChatsBtn.addEventListener(

        "click",

        () => {

            if (!conversation.length) {

                return;

            }


            const confirmed =
                confirm(
                    "Clear this conversation?"
                );


            if (!confirmed) {

                return;

            }


            newChat();

        }

    );

}


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const theme =

        localStorage.getItem(
            THEME_KEY
        )

        || "dark";


    if (
        theme === "light"
    ) {

        document.body.classList.add(
            "light"
        );

    }


    updateThemeButton();

}


function toggleTheme() {

    document.body.classList.toggle(
        "light"
    );


    const theme =

        document.body.classList.contains(
            "light"
        )

            ? "light"

            : "dark";


    localStorage.setItem(
        THEME_KEY,
        theme
    );


    updateThemeButton();

}


function updateThemeButton() {

    const light =

        document.body.classList.contains(
            "light"
        );


    if (themeBtn) {

        themeBtn.textContent =
            light ? "☀" : "◐";

    }


    if (modalThemeBtn) {

        modalThemeBtn.textContent =
            light ? "Light" : "Dark";

    }

}


if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        toggleTheme
    );

}


if (modalThemeBtn) {

    modalThemeBtn.addEventListener(
        "click",
        toggleTheme
    );

}


/* =========================================================
   SETTINGS
========================================================= */

if (settingsBtn) {

    settingsBtn.addEventListener(

        "click",

        () => {

            settingsModal.classList.remove(
                "hidden"
            );

        }

    );

}


function closeSettingsModal() {

    settingsModal.classList.add(
        "hidden"
    );

}


if (closeSettings) {

    closeSettings.addEventListener(
        "click",
        closeSettingsModal
    );

}


if (closeSettings2) {

    closeSettings2.addEventListener(
        "click",
        closeSettingsModal
    );

}


if (settingsModal) {

    settingsModal.addEventListener(

        "click",

        event => {

            if (
                event.target ===
                settingsModal
            ) {

                closeSettingsModal();

            }

        }

    );

}


/* =========================================================
   SETTINGS STORAGE
========================================================= */

function loadSettings() {

    try {

        const saved =
            JSON.parse(

                localStorage.getItem(
                    SETTINGS_KEY
                )

            );


        if (!saved) {

            return;

        }


        if (

            soundToggle &&

            typeof saved.sound !==
            "undefined"

        ) {

            soundToggle.checked =
                saved.sound;

        }


        if (

            enterToggle &&

            typeof saved.enter !==
            "undefined"

        ) {

            enterToggle.checked =
                saved.enter;

        }

    }

    catch {}

}


function saveSettings() {

    localStorage.setItem(

        SETTINGS_KEY,

        JSON.stringify({

            sound:

                soundToggle
                    ? soundToggle.checked
                    : false,

            enter:

                enterToggle
                    ? enterToggle.checked
                    : true

        })

    );

}


if (soundToggle) {

    soundToggle.addEventListener(

        "change",

        saveSettings

    );

}


if (enterToggle) {

    enterToggle.addEventListener(

        "change",

        saveSettings

    );

}

/* =========================================================
   SEARCH
========================================================= */

if (searchBtn) {

    searchBtn.addEventListener(

        "click",

        () => {

            searchPanel.classList.toggle(
                "active"
            );


            if (

                searchPanel.classList.contains(
                    "active"
                )

            ) {

                searchInput.focus();

            }

        }

    );

}


if (closeSearch) {

    closeSearch.addEventListener(

        "click",

        () => {

            searchPanel.classList.remove(
                "active"
            );


            searchInput.value =
                "";


            removeHighlights();

        }

    );

}


if (searchInput) {

    searchInput.addEventListener(

        "input",

        searchMessages

    );

}


function searchMessages() {

    removeHighlights();


    const query =

        searchInput.value
            .trim()
            .toLowerCase();


    if (!query) {

        return;

    }


    document
        .querySelectorAll(
            ".message-row"
        )
        .forEach(row => {

            const text =
                row.innerText
                    .toLowerCase();


            if (
                text.includes(query)
            ) {

                row.style.outline =
                    "2px solid rgba(124,92,255,.45)";

            }

        });

}


function removeHighlights() {

    document
        .querySelectorAll(
            ".message-row"
        )
        .forEach(row => {

            row.style.outline =
                "";

        });

}


/* =========================================================
   FILE ATTACHMENT
========================================================= */

if (attachBtn) {

    attachBtn.addEventListener(

        "click",

        () => {

            fileInput.click();

        }

    );

}


if (fileInput) {

    fileInput.addEventListener(

        "change",

        async () => {

            if (
                !fileInput.files.length
            ) {

                return;

            }


            /*
             * Current selected filename
             */

            const names =

                Array.from(
                    fileInput.files
                )

                    .map(
                        file =>
                            file.name
                    )

                    .join(", ");


            messageInput.value +=
                ` [Attached: ${names}]`;


            updateCounter();

            autoResize();


            showToast(

                `${fileInput.files.length} file(s) selected`

            );

        }

    );

}


/* =========================================================
   FULLSCREEN
========================================================= */

if (fullscreenBtn) {

    fullscreenBtn.addEventListener(

        "click",

        async () => {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await document
                        .documentElement
                        .requestFullscreen();

                }

                else {

                    await document
                        .exitFullscreen();

                }

            }

            catch {

                showToast(
                    "Fullscreen unavailable"
                );

            }

        }

    );

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

if (mobileMenu) {

    mobileMenu.addEventListener(

        "click",

        () => {

            sidebar.classList.toggle(
                "open"
            );

        }

    );

}

/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    if (!toast) {

        return;

    }


    const text =
        toast.querySelector("p");


    if (!text) {

        return;

    }


    text.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =

        setTimeout(

            () => {

                toast.classList.remove(
                    "show"
                );

            },

            2200

        );

}


/* =========================================================
   NOTIFICATION SOUND
========================================================= */

function playNotificationSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        const context =
            new AudioContext();


        const oscillator =
            context.createOscillator();


        const gain =
            context.createGain();


        oscillator.frequency.value =
            660;


        oscillator.type =
            "sine";


        gain.gain.value =
            0.04;


        oscillator.connect(
            gain
        );


        gain.connect(
            context.destination
        );


        oscillator.start();


        oscillator.stop(

            context.currentTime +
            0.12

        );

    }

    catch {}

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(

    "keydown",

    event => {

        /*
         * Ctrl + K = Search
         */

        if (

            event.ctrlKey &&

            event.key.toLowerCase() ===
                "k"

        ) {

            event.preventDefault();


            if (searchPanel) {

                searchPanel.classList.add(
                    "active"
                );

            }


            if (searchInput) {

                searchInput.focus();

            }

        }


        /*
         * Ctrl + Shift + N = New Chat
         */

        if (

            event.ctrlKey &&

            event.shiftKey &&

            event.key.toLowerCase() ===
                "n"

        ) {

            event.preventDefault();

            newChat();

        }


        /*
         * Escape
         */

        if (
            event.key === "Escape"
        ) {

            if (settingsModal) {

                settingsModal.classList.add(
                    "hidden"
                );

            }


            if (searchPanel) {

                searchPanel.classList.remove(
                    "active"
                );

            }

        }

    }

);