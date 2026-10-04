/* =========================================================
   UNIVERSE AI — FRONTEND ENGINE
   FastAPI + Google Gemini

   * One chat = one session (stored online on the server)
   * Sessions list in sidebar: open / rename / delete
   * "New Chat" starts a fresh session
========================================================= */

const API_BASE_URL = "https://universe-ai-58di.onrender.com";


/* ================= ELEMENTS ================= */

const $ = id => document.getElementById(id);

const messages = $("messages");
const chatArea = $("chatArea");
const messageInput = $("messageInput");
const sendBtn = $("sendBtn");
const welcome = $("welcome");
const typing = $("typing");

const chatHistory = $("chatHistory");
const newChatBtn = $("newChatBtn");
const newChatTop = $("newChatTop");
const clearChatsBtn = $("clearChatsBtn");
const exportBtn = $("exportBtn");

const themeBtn = $("themeBtn");
const modalThemeBtn = $("modalThemeBtn");

const settingsBtn = $("settingsBtn");
const settingsModal = $("settingsModal");
const closeSettings = $("closeSettings");
const closeSettings2 = $("closeSettings2");

const searchBtn = $("searchBtn");
const searchPanel = $("searchPanel");
const searchInput = $("searchInput");
const closeSearch = $("closeSearch");

const voiceBtn = $("voiceBtn");

const attachBtn = $("attachBtn");
const fileInput = $("fileInput");
const attachChip = $("attachChip");
const attachName = $("attachName");
const removeAttach = $("removeAttach");

const fullscreenBtn = $("fullscreenBtn");

const mobileMenu = $("mobileMenu");
const sidebar = $("sidebar");
const sidebarClose = $("sidebarClose");
const sidebarOverlay = $("sidebarOverlay");

const toast = $("toast");
const messageCounter = $("messageCounter");

const soundToggle = $("soundToggle");
const enterToggle = $("enterToggle");


/* ================= STORAGE KEYS =================
   NOTE: chat messages are NOT stored in the browser.
   Only small preferences + a private client id + the
   id of the chat that was open last are kept locally.
================================================== */

const THEME_KEY = "universe_ai_theme";
const SETTINGS_KEY = "universe_ai_settings";
const CLIENT_KEY = "universe_client_id";
const ACTIVE_KEY = "universe_active_chat";


/* ================= STATE ================= */

let CLIENT_ID = getClientId();

let chats = [];                // sessions list (from server)
let currentChatId = null;      // active session id (null = new, not created yet)
let currentMessages = [];      // messages of the active session (for export)
let pendingDocument = null;    // { filename, text }

let isGenerating = false;

let recognition = null;
let isListening = false;

let toastTimer = null;
/* =========================================================
   HELPERS
========================================================= */

function getClientId() {

    let id = localStorage.getItem(CLIENT_KEY);

    if (!id) {

        id = (window.crypto && crypto.randomUUID)
            ? crypto.randomUUID()
            : "c-" + Date.now().toString(36) + "-" +
              Math.random().toString(36).slice(2, 12);

        localStorage.setItem(CLIENT_KEY, id);

    }

    return id;

}


function el(tag, className, text) {

    const node = document.createElement(tag);

    if (className) node.className = className;

    if (text !== undefined) node.textContent = text;

    return node;

}


function getTime() {

    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


function formatServerTime(value) {

    if (!value) return getTime();

    // SQLite CURRENT_TIMESTAMP is UTC: "YYYY-MM-DD HH:MM:SS"
    const date = new Date(value.replace(" ", "T") + "Z");

    if (isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


function isMobile() {

    return window.matchMedia("(max-width: 900px)").matches;

}


/* ================= API ================= */

async function api(path, options = {}) {

    const response = await fetch(API_BASE_URL + path, {

        ...options,

        headers: {
            "Content-Type": "application/json",
            "X-Client-Id": CLIENT_ID,
            ...(options.headers || {})
        }

    });

    if (!response.ok) {

        let detail = "";

        try {

            const data = await response.clone().json();

            detail = data.detail || JSON.stringify(data);

        } catch {

            detail = await response.text();

        }

        const error = new Error(
            detail || `Server error ${response.status}`
        );

        error.status = response.status;

        throw error;

    }

    return response;

}


async function createChat() {

    const response = await api("/api/chats", {
        method: "POST",
        body: JSON.stringify({ title: "New Conversation" })
    });

    const data = await response.json();

    currentChatId = data.id;

    localStorage.setItem(ACTIVE_KEY, currentChatId);

    return currentChatId;

}
/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    loadSettings();

    setupVoiceRecognition();

    setupPromptCards();

    autoResize();

    updateCounter();

    initSessions();

});


async function initSessions() {

    renderChatList("loading");

    const active = localStorage.getItem(ACTIVE_KEY);

    // load sessions list and re-open the last chat in parallel
    const listPromise = loadChats();

    if (active) {

        await openChat(active, { silent: true });

    }

    await listPromise;

}
/* =========================================================
   SESSIONS LIST (sidebar)
========================================================= */

async function loadChats() {

    try {

        const response = await api("/api/chats");

        const data = await response.json();

        chats = Array.isArray(data.chats) ? data.chats : [];

        renderChatList();

    } catch (error) {

        console.error("Could not load chats:", error);

        renderChatList("error");

    }

}


function renderChatList(state) {

    chatHistory.innerHTML = "";

    if (state === "loading") {

        chatHistory.appendChild(
            el("div", "history-item empty", "Loading chats…")
        );

        return;

    }

    if (state === "error") {

        const retry = el(
            "div",
            "history-item empty",
            "Could not load chats. Tap to retry."
        );

        retry.style.cursor = "pointer";

        retry.addEventListener("click", () => {

            renderChatList("loading");

            loadChats();

        });

        chatHistory.appendChild(retry);

        return;

    }

    if (!chats.length) {

        chatHistory.appendChild(
            el("div", "history-item empty", "No conversations yet")
        );

        return;

    }

    chats.forEach(chat => {

        const item = el("div", "history-item");

        if (chat.id === currentChatId) {

            item.classList.add("active");

        }

        item.title = chat.title;

        const title = el("span", "history-title", chat.title);

        const actions = el("div", "history-actions");

        const renameBtn = el("button", "rename-chat", "✎");

        renameBtn.type = "button";

        renameBtn.title = "Rename";

        renameBtn.addEventListener("click", event => {

            event.stopPropagation();

            renameChat(chat);

        });

        const deleteBtn = el("button", "delete-chat", "🗑");

        deleteBtn.type = "button";

        deleteBtn.title = "Delete";

        deleteBtn.addEventListener("click", event => {

            event.stopPropagation();

            deleteChat(chat);

        });

        actions.append(renameBtn, deleteBtn);

        item.append(title, actions);

        item.addEventListener("click", () => openChat(chat.id));

        chatHistory.appendChild(item);

    });

}


async function renameChat(chat) {

    const name = prompt("Rename conversation:", chat.title);

    if (name === null) return;

    const title = name.trim();

    if (!title) return;

    try {

        await api(`/api/chats/${chat.id}`, {
            method: "PATCH",
            body: JSON.stringify({ title })
        });

        chat.title = title.slice(0, 80);

        renderChatList();

        showToast("Conversation renamed");

    } catch (error) {

        showToast(error.message || "Rename failed");

    }

}


async function deleteChat(chat) {

    if (!confirm(`Delete "${chat.title}"?`)) return;

    if (isGenerating && chat.id === currentChatId) {

        showToast("Please wait for the reply to finish");

        return;

    }

    try {

        await api(`/api/chats/${chat.id}`, { method: "DELETE" });

        chats = chats.filter(item => item.id !== chat.id);

        if (chat.id === currentChatId) {

            resetChatView();

        }

        renderChatList();

        showToast("Conversation deleted");

    } catch (error) {

        showToast(error.message || "Delete failed");

    }

}
/* =========================================================
   OPEN / NEW CHAT
========================================================= */

function resetChatView() {

    currentChatId = null;

    currentMessages = [];

    localStorage.removeItem(ACTIVE_KEY);

    messages.innerHTML = "";

    welcome.classList.remove("hidden");

    clearAttachment();

}


async function openChat(chatId, options = {}) {

    if (isGenerating) {

        showToast("Please wait for the reply to finish");

        return;

    }

    if (!options.silent && chatId === currentChatId) {

        closeSidebar();

        return;

    }

    messages.innerHTML = "";

    welcome.classList.add("hidden");

    const loading = el("div", "", "Loading conversation…");

    loading.style.cssText =
        "text-align:center;color:var(--muted);font-size:13px;padding:40px 0";

    messages.appendChild(loading);

    try {

        const response = await api(`/api/chats/${chatId}/messages`);

        const data = await response.json();

        messages.innerHTML = "";

        currentChatId = chatId;

        currentMessages = [];

        localStorage.setItem(ACTIVE_KEY, chatId);

        if (!options.silent) clearAttachment();

        (data.messages || []).forEach(item => {

            const role = item.role === "assistant" ? "assistant" : "user";

            const time = formatServerTime(item.created_at);

            const built = buildMessageRow(role, item.content, time);

            addTools(built.tools, role, item.content);

            currentMessages.push({
                role,
                text: item.content,
                time
            });

        });

        if (!currentMessages.length) {

            welcome.classList.remove("hidden");

        }

        renderChatList();

        scrollToBottom(true);

        closeSidebar();

    } catch (error) {

        console.error("Open chat error:", error);

        // chat no longer exists (e.g. deleted) → start fresh
        if (error.status === 404) {

            resetChatView();

        } else {

            messages.innerHTML = "";

            welcome.classList.remove("hidden");

            showToast("Could not load conversation");

        }

        renderChatList();

    }

}


function newChat() {

    if (isGenerating) {

        showToast("Please wait for the reply to finish");

        return;

    }

    resetChatView();

    messageInput.value = "";

    updateCounter();

    autoResize();

    renderChatList();

    closeSidebar();

    messageInput.focus();

    showToast("New conversation started");

}


if (newChatBtn) newChatBtn.addEventListener("click", newChat);

if (newChatTop) newChatTop.addEventListener("click", newChat);


if (clearChatsBtn) {

    clearChatsBtn.addEventListener("click", async () => {

        if (!chats.length) return;

        if (isGenerating) {

            showToast("Please wait for the reply to finish");

            return;

        }

        if (!confirm("Delete ALL conversations? This cannot be undone.")) {

            return;

        }

        try {

            await api("/api/chats", { method: "DELETE" });

            chats = [];

            resetChatView();

            renderChatList();

            showToast("All conversations deleted");

        } catch (error) {

            showToast(error.message || "Could not delete chats");

        }

    });

}
/* =========================================================
   MESSAGE RENDERING
========================================================= */

function setBubble(bubble, role, text) {

    if (role === "assistant") {

        bubble.innerHTML = formatAIResponse(text);

    } else {

        bubble.textContent = text;

    }

}


function buildMessageRow(role, text, time) {

    const row = el("div", `message-row ${role}`);

    const avatar = el(
        "div",
        "avatar",
        role === "assistant" ? "✦" : "YOU"
    );

    const content = el("div", "message-content");

    const bubble = el("div", "message-bubble");

    setBubble(bubble, role, text);

    const timeEl = el("div", "message-time", time || "");

    const tools = el("div", "message-tools");

    content.append(bubble, timeEl, tools);

    row.append(avatar, content);

    messages.appendChild(row);

    return { row, bubble, tools };

}


function addTools(tools, role, text) {

    tools.innerHTML = "";

    tools.appendChild(
        createToolButton("⧉ Copy", () => copyText(text))
    );

    if (role === "assistant") {

        tools.appendChild(
            createToolButton("🔊 Speak", () => speakText(text))
        );

    }

}


function createToolButton(label, callback) {

    const button = el("button", "", label);

    button.type = "button";

    button.addEventListener("click", callback);

    return button;

}


/* ================= MARKDOWN-LITE FORMATTER ================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatAIResponse(text) {

    if (!text) return "";

    const blocks = [];

    // 1. pull out code blocks (also handles unfinished block while streaming)
    let source = text.replace(
        /```([\w+-]*)\n?([\s\S]*?)(```|$)/g,
        (match, lang, code) => {

            blocks.push({
                lang: lang || "code",
                code: code.replace(/\n$/, "")
            });

            return `\u0000B${blocks.length - 1}\u0000`;

        }
    );

    // 2. escape everything else
    let html = escapeHTML(source);

    // 3. inline code
    html = html.replace(
        /`([^`\n]+)`/g,
        '<code class="inline-code">$1</code>'
    );

    // 4. headings
    html = html.replace(
        /^#{1,6}[ \t]+(.+?)(\n|$)/gm,
        '<strong class="md-h">$1</strong>'
    );

    // 5. bullets
    html = html.replace(/^([ \t]*)[*-][ \t]+/gm, "$1• ");

    // 6. bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // 7. line breaks
    html = html.replace(/\n/g, "<br>");

    // 8. put code blocks back
    html = html.replace(/\u0000B(\d+)\u0000/g, (match, index) => {

        const block = blocks[Number(index)];

        return (
            '<div class="code-wrap">' +
            '<div class="code-head">' +
            `<span>${escapeHTML(block.lang)}</span>` +
            '<button type="button" class="code-copy">Copy</button>' +
            "</div>" +
            `<pre class="code-block"><code>${escapeHTML(block.code)}</code></pre>` +
            "</div>"
        );

    });

    return html;

}


// copy button inside code blocks
messages.addEventListener("click", event => {

    const button = event.target.closest(".code-copy");

    if (!button) return;

    const code = button
        .closest(".code-wrap")
        .querySelector("code").textContent;

    copyText(code);

    button.textContent = "Copied ✓";

    setTimeout(() => {

        button.textContent = "Copy";

    }, 1500);

});
/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text || isGenerating) return;

    isGenerating = true;

    sendBtn.disabled = true;

    // ---------- show user message ----------

    const userTime = getTime();

    const shownText = pendingDocument
        ? `📎 ${pendingDocument.filename}\n${text}`
        : text;

    welcome.classList.add("hidden");

    const userRow = buildMessageRow("user", shownText, userTime);

    addTools(userRow.tools, "user", text);

    currentMessages.push({
        role: "user",
        text: shownText,
        time: userTime
    });

    messageInput.value = "";

    updateCounter();

    autoResize();

    showTyping(true);

    try {

        // ---------- make sure a session exists ----------

        let chatId = currentChatId || await createChat();

        const body = () => JSON.stringify({
            message: text,
            session_id: chatId,
            document: pendingDocument ? pendingDocument.text : null
        });

        let response;

        try {

            response = await api("/api/chat", {
                method: "POST",
                headers: { Accept: "text/plain" },
                body: body()
            });

        } catch (error) {

            // session vanished on server (e.g. database reset) → recreate once
            if (error.status === 404) {

                currentChatId = null;

                chatId = await createChat();

                response = await api("/api/chat", {
                    method: "POST",
                    headers: { Accept: "text/plain" },
                    body: body()
                });

            } else {

                throw error;

            }

        }

        showTyping(false);

        // ---------- assistant message (streamed) ----------

        const assistant = buildMessageRow("assistant", "", getTime());

        let reply = "";

        if (!response.body) {

            reply = await response.text();

            setBubble(assistant.bubble, "assistant", reply);

        } else {

            const reader = response.body.getReader();

            const decoder = new TextDecoder();

            while (true) {

                const result = await reader.read();

                if (result.done) break;

                reply += decoder.decode(result.value, { stream: true });

                setBubble(assistant.bubble, "assistant", reply);

                scrollToBottom(true);

            }

            const rest = decoder.decode();

            if (rest) {

                reply += rest;

                setBubble(assistant.bubble, "assistant", reply);

            }

        }

        if (!reply.trim()) {

            reply = "⚠️ AI ne koi response nahi diya.";

            setBubble(assistant.bubble, "assistant", reply);

        }

        addTools(assistant.tools, "assistant", reply);

        currentMessages.push({
            role: "assistant",
            text: reply,
            time: getTime()
        });

        scrollToBottom(true);

        // refresh sidebar (new title / ordering) from the server
        loadChats();

        if (soundToggle && soundToggle.checked) {

            playNotificationSound();

        }

    } catch (error) {

        console.error("Chat Error:", error);

        showTyping(false);

        const message =
            error.message === "Failed to fetch"
                ? "Server se connect nahi ho pa raha. Internet check karein ya thodi der baad try karein (server jag raha ho sakta hai)."
                : (error.message || "Something went wrong. Please try again.");

        const errorRow = buildMessageRow(
            "assistant",
            "❌ Error: " + message,
            getTime()
        );

        addTools(errorRow.tools, "assistant", message);

    } finally {

        isGenerating = false;

        sendBtn.disabled = false;

        messageInput.focus();

    }

}


sendBtn.addEventListener("click", sendMessage);


messageInput.addEventListener("keydown", event => {

    if (
        event.key === "Enter" &&
        !event.shiftKey &&
        enterToggle.checked
    ) {

        event.preventDefault();

        sendMessage();

    }

});


messageInput.addEventListener("input", () => {

    autoResize();

    updateCounter();

});
/* =========================================================
   UI HELPERS
========================================================= */

function showTyping(show) {

    typing.classList.toggle("hidden", !show);

    if (show) scrollToBottom(true);

}


function scrollToBottom(instant) {

    if (instant) {

        chatArea.scrollTop = chatArea.scrollHeight;

        return;

    }

    setTimeout(() => {

        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: "smooth"
        });

    }, 30);

}


function autoResize() {

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(messageInput.scrollHeight, 150) + "px";

}


function updateCounter() {

    if (!messageCounter) return;

    messageCounter.textContent =
        `${messageInput.value.length} characters`;

}


function showToast(message) {

    if (!toast) return;

    const text = toast.querySelector("p");

    if (!text) return;

    text.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);

}
/* =========================================================
   COPY / SPEAK
========================================================= */

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(text);

    } catch {

        const textarea = document.createElement("textarea");

        textarea.value = text;

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

    }

    showToast("Copied to clipboard");

}


async function speakText(text) {

    const clean = text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/[*#`]/g, "")
        .trim();

    if (!clean) return;

    try {

        const isAndroidApp =
            typeof window.Capacitor !== "undefined" &&
            window.Capacitor.isNativePlatform &&
            window.Capacitor.isNativePlatform();

        if (isAndroidApp) {

            await window.Capacitor.Plugins.TextToSpeech.stop();

            await window.Capacitor.Plugins.TextToSpeech.speak({
                text: clean,
                lang: "en-IN",
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0
            });

            showToast("UNIVERSE is speaking ??");
            return;
        }

        if (!("speechSynthesis" in window)) {

            showToast("Speech is not supported");
            return;
        }

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(clean);

        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;

        window.speechSynthesis.speak(speech);

        showToast("UNIVERSE is speaking ??");

    } catch (error) {

        console.error("Text-to-Speech error:", error);
        showToast("Unable to start speech");

    }
}

    window.speechSynthesis.cancel();

    const clean = text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/[*#`]/g, "");

    const speech = new SpeechSynthesisUtterance(clean);

    speech.rate = 1;

    speech.pitch = 1;

    speech.volume = 1;

    window.speechSynthesis.speak(speech);

    showToast("UNIVERSE is speaking 🔊");

}
/* =========================================================
   VOICE INPUT
========================================================= */

function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        if (voiceBtn) voiceBtn.title = "Voice input is not supported";

        return;

    }

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.onstart = () => {

        isListening = true;

        voiceBtn.classList.add("active");

        showToast("Listening... 🎙");

    };

    recognition.onresult = event => {

        const transcript = event.results[0][0].transcript;

        messageInput.value +=
            (messageInput.value ? " " : "") + transcript;

        updateCounter();

        autoResize();

    };

    recognition.onerror = () => {

        showToast("Voice recognition failed");

    };

    recognition.onend = () => {

        isListening = false;

        voiceBtn.classList.remove("active");

    };

}


if (voiceBtn) {

    voiceBtn.addEventListener("click", () => {

        if (!recognition) {

            showToast("Try Chrome or Edge for voice input");

            return;

        }

        if (isListening) {

            recognition.stop();

        } else {

            recognition.start();

        }

    });

}
/* =========================================================
   PROMPT CARDS
========================================================= */

function setupPromptCards() {

    document.querySelectorAll(".prompt-card").forEach(card => {

        card.addEventListener("click", () => {

            messageInput.value = card.dataset.prompt;

            updateCounter();

            autoResize();

            messageInput.focus();

        });

    });

}
/* =========================================================
   FILE ATTACHMENT (PDF / TXT → sent as document context)
========================================================= */

function clearAttachment() {

    pendingDocument = null;

    fileInput.value = "";

    attachChip.classList.add("hidden");

    attachName.textContent = "";

}


if (attachBtn) {

    attachBtn.addEventListener("click", () => fileInput.click());

}


if (removeAttach) {

    removeAttach.addEventListener("click", () => {

        clearAttachment();

        showToast("File removed");

    });

}


if (fileInput) {

    fileInput.addEventListener("change", async () => {

        const file = fileInput.files[0];

        if (!file) return;

        showToast("Reading file…");

        try {

            const form = new FormData();

            form.append("file", file);

            const response = await fetch(API_BASE_URL + "/api/upload", {
                method: "POST",
                body: form
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {

                throw new Error(data.detail || "Upload failed");

            }

            pendingDocument = {
                filename: data.filename,
                text: data.text
            };

            attachName.textContent = data.filename;

            attachChip.classList.remove("hidden");

            showToast("File ready — ask a question about it");

            messageInput.focus();

        } catch (error) {

            clearAttachment();

            showToast(
                error.message === "Failed to fetch"
                    ? "Could not reach server"
                    : error.message
            );

        }

    });

}
/* =========================================================
   EXPORT CONVERSATION
========================================================= */

if (exportBtn) {

    exportBtn.addEventListener("click", () => {

        if (!currentMessages.length) {

            showToast("Nothing to export yet");

            return;

        }

        const lines = currentMessages.map(item => {

            const who = item.role === "assistant" ? "UNIVERSE AI" : "YOU";

            return `[${item.time}] ${who}:\n${item.text}`;

        });

        const content =
            "UNIVERSE AI — Conversation\n" +
            "===========================\n\n" +
            lines.join("\n\n");

        const blob = new Blob([content], {
            type: "text/plain;charset=utf-8"
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "universe-ai-chat.txt";

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        showToast("Conversation exported");

    });

}
/* =========================================================
   MOBILE SIDEBAR (open / close with X, overlay, Esc)
========================================================= */

function openSidebar() {

    sidebar.classList.add("open");

    sidebarOverlay.classList.add("show");

}


function closeSidebar() {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("show");

}


if (mobileMenu) {

    mobileMenu.addEventListener("click", () => {

        if (sidebar.classList.contains("open")) {

            closeSidebar();

        } else {

            openSidebar();

        }

    });

}


if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);

if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);


window.addEventListener("resize", () => {

    if (!isMobile()) closeSidebar();

});
/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const theme = localStorage.getItem(THEME_KEY) || "dark";

    if (theme === "light") document.body.classList.add("light");

    updateThemeButton();

}


function toggleTheme() {

    document.body.classList.toggle("light");

    localStorage.setItem(
        THEME_KEY,
        document.body.classList.contains("light") ? "light" : "dark"
    );

    updateThemeButton();

}


function updateThemeButton() {

    const light = document.body.classList.contains("light");

    if (themeBtn) themeBtn.textContent = light ? "☀" : "◐";

    if (modalThemeBtn) modalThemeBtn.textContent = light ? "Light" : "Dark";

}


if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

if (modalThemeBtn) modalThemeBtn.addEventListener("click", toggleTheme);
/* =========================================================
   SETTINGS
========================================================= */

function closeSettingsModal() {

    settingsModal.classList.add("hidden");

}


if (settingsBtn) {

    settingsBtn.addEventListener("click", () => {

        settingsModal.classList.remove("hidden");

        closeSidebar();

    });

}

if (closeSettings) closeSettings.addEventListener("click", closeSettingsModal);

if (closeSettings2) closeSettings2.addEventListener("click", closeSettingsModal);

if (settingsModal) {

    settingsModal.addEventListener("click", event => {

        if (event.target === settingsModal) closeSettingsModal();

    });

}


function loadSettings() {

    try {

        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));

        if (!saved) return;

        if (soundToggle && typeof saved.sound !== "undefined") {

            soundToggle.checked = saved.sound;

        }

        if (enterToggle && typeof saved.enter !== "undefined") {

            enterToggle.checked = saved.enter;

        }

    } catch {}

}


function saveSettings() {

    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        sound: soundToggle ? soundToggle.checked : false,
        enter: enterToggle ? enterToggle.checked : true
    }));

}

if (soundToggle) soundToggle.addEventListener("change", saveSettings);

if (enterToggle) enterToggle.addEventListener("change", saveSettings);
/* =========================================================
   SEARCH (inside current conversation)
========================================================= */

function removeHighlights() {

    document.querySelectorAll(".message-row").forEach(row => {

        row.style.outline = "";

    });

}


function searchMessages() {

    removeHighlights();

    const query = searchInput.value.trim().toLowerCase();

    if (!query) return;

    let first = null;

    document.querySelectorAll(".message-row").forEach(row => {

        if (row.innerText.toLowerCase().includes(query)) {

            row.style.outline = "2px solid rgba(124,92,255,.45)";

            row.style.outlineOffset = "4px";

            if (!first) first = row;

        }

    });

    if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });

}


if (searchBtn) {

    searchBtn.addEventListener("click", () => {

        searchPanel.classList.toggle("active");

        if (searchPanel.classList.contains("active")) searchInput.focus();

    });

}

if (closeSearch) {

    closeSearch.addEventListener("click", () => {

        searchPanel.classList.remove("active");

        searchInput.value = "";

        removeHighlights();

    });

}

if (searchInput) searchInput.addEventListener("input", searchMessages);
/* =========================================================
   FULLSCREEN
========================================================= */

if (fullscreenBtn) {

    fullscreenBtn.addEventListener("click", async () => {

        try {

            if (!document.fullscreenElement) {

                await document.documentElement.requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch {

            showToast("Fullscreen unavailable");

        }

    });

}
/* =========================================================
   NOTIFICATION SOUND
========================================================= */

function playNotificationSound() {

    try {

        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        const context = new AudioContext();

        const oscillator = context.createOscillator();

        const gain = context.createGain();

        oscillator.frequency.value = 660;

        oscillator.type = "sine";

        gain.gain.value = 0.04;

        oscillator.connect(gain);

        gain.connect(context.destination);

        oscillator.start();

        oscillator.stop(context.currentTime + 0.12);

    } catch {}

}
/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener("keydown", event => {

    // Ctrl + K = search
    if (event.ctrlKey && event.key.toLowerCase() === "k") {

        event.preventDefault();

        searchPanel.classList.add("active");

        searchInput.focus();

    }

    // Ctrl + Shift + N = new chat
    if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "n"
    ) {

        event.preventDefault();

        newChat();

    }

    // Escape = close everything open
    if (event.key === "Escape") {

        settingsModal.classList.add("hidden");

        searchPanel.classList.remove("active");

        closeSidebar();

    }

});





