/* main.js */

// --------- 1. DEFINE YOUR BACKEND URL ---------
// This is your deployed backend on Render
const MY_BACKEND_API_ROOT = "https://pratik-1.onrender.com";



// --------- 2. PROJECT RENDERING (FOR HOME & PROJECTS PAGE) ---------
const sampleProjects = [
  { title: "Portfolio Website", description: "Personal portfolio with contact form and blog.", tags: ["React", "Tailwind"], image: "" },
  { title: "Ecommerce Demo", description: "Headless commerce with Stripe.", tags: ["Next.js", "Stripe"], image: "" },
  { title: "Dashboard App", description: "Analytics dashboard with PostgreSQL.", tags: ["Node", "Postgres"], image: "" }
];

function renderProjectsGrid() {
  const grid = document.getElementById("projects-grid");
  const preview = document.getElementById("projects-preview");
  if (grid) {
    grid.innerHTML = sampleProjects.map(p => `
      <div class="glassmorphism p-4 rounded-lg">
        <h3 class="font-semibold">${p.title}</h3>
        <p class="text-sm mt-2 text-slate-300">${p.description}</p>
        <div class="mt-3 flex gap-2">${(p.tags || []).map(t => `<span class="text-xs px-2 py-1 bg-slate-800 rounded">${t}</span>`).join('')}</div>
      </div>
    `).join("");
  }
  if (preview) {
    preview.innerHTML = sampleProjects.slice(0, 3).map(p => `
      <div class="glassmorphism p-4 rounded-lg">
        <h4 class="font-semibold">${p.title}</h4>
        <p class="text-sm text-slate-300 mt-2">${p.description}</p>
      </div>
    `).join("");
  }
}
// Run it on page load
renderProjectsGrid();


// --------- 3. CONTACT FORM (FOR CONTACT PAGE) ---------
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formStatus.innerHTML = '<span class="text-yellow-300">Sending...</span>';

    const name = (document.getElementById("name") || {}).value;
    const email = (document.getElementById("email") || {}).value;
    const phone = (document.getElementById("phone") || {}).value;
    const message = (document.getElementById("message") || {}).value;

    if (!name || !email || !message) {
      formStatus.innerHTML = '<span class="text-red-400">Please fill required fields</span>';
      return;
    }

    try {
      // Send data to our backend
      const response = await fetch(`${MY_BACKEND_API_ROOT}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, message })
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      formStatus.innerHTML = '<span class="text-green-400">Message sent!</span>';
      contactForm.reset();
      setTimeout(() => formStatus.textContent = '', 4000);

    } catch (err) {
      console.error(err);
      formStatus.innerHTML = '<span class="text-red-400">Error sending message</span>';
    }
  });
}


// --------- 4. ADMIN PANEL (FOR ADMIN PAGE) ---------
const adminLoginBtn = document.getElementById("admin-login");
const adminLogoutBtn = document.getElementById("admin-logout");
const messagesList = document.getElementById("messages-list");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");

// This function just renders the HTML for the messages
function renderAdminMessages(messages) {
  if (!messagesList) return;
  messagesList.innerHTML = messages.map(m => `
    <div class="glassmorphism p-4 rounded">
      <div class="flex justify-between items-start">
        <div>
          <div class="font-semibold">${m.name} <span class="text-slate-400 text-sm">&lt;${m.email}&gt;</span></div>
          <div class="text-xs text-slate-400">Phone: ${m.phone || 'N/A'}</div>
          <div class="text-xs text-slate-400">${new Date(m.createdAt).toLocaleString()}</div>
        </div>
      </div>
      <p class="mt-3 text-slate-300">${m.message}</p>
    </div>
  `).join("");
}

// Handle Admin Login
if (adminLoginBtn) {
  adminLoginBtn.addEventListener("click", async () => {
    const pass = document.getElementById("admin-pass").value;

    try {
      // Use the *full* URL to your backend
      const res = await fetch(`${MY_BACKEND_API_ROOT}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });

      if (res.status === 401) {
        alert("Login failed: Incorrect password.");
        return;
      }
      if (!res.ok) {
        throw new Error('Server error');
      }

      const messages = await res.json();
      
      // Success! Render messages and show the panel
      renderAdminMessages(messages);
      if (adminPanel) adminPanel.classList.remove("hidden");
      if (loginForm) loginForm.classList.add("hidden");
      if (adminLogoutBtn) adminLogoutBtn.classList.remove("hidden");

    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });
}

// Handle Admin Logout (simple hide/show)
if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", () => {
    if (adminPanel) adminPanel.classList.add("hidden");
    if (loginForm) loginForm.classList.remove("hidden");
    if (adminLogoutBtn) adminLogoutBtn.classList.add("hidden");
    document.getElementById("admin-pass").value = ""; // Clear password field
  });
}


// --------- 5. AI TOOLS (FOR AI PAGE) ---------

// Use the *same* backend root as your contact form
const AI_BACKEND_URL = `${MY_BACKEND_API_ROOT}/api/ai`;

// Function to call the AI backend
async function aiChat(prompt) {
  try {
    const res = await fetch(AI_BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      throw new Error('AI server error');
    }
    return res.json();
  } catch (err) {
    console.error(err);
    return { error: "Failed to connect to the AI. " + err.message };
  }
}

// AI Chat Assistant
const chatSend = document.getElementById("chat-send");
if (chatSend) {
  const chatLog = document.getElementById("chat-log");
  const chatInput = document.getElementById("chat-input");
  
  chatSend.addEventListener("click", async () => {
    const prompt = chatInput.value.trim();
    if (!prompt) return;
    
    // 1. Add user message
    chatLog.insertAdjacentHTML("beforeend", `<div class="p-2 text-slate-200 bg-slate-800 rounded">You: ${prompt}</div>`);
    chatInput.value = "";
    
    // 2. Show loading
    const loading = document.createElement("div");
    loading.textContent = "AI is typing...";
    loading.className = "text-slate-400";
    chatLog.appendChild(loading);
    chatLog.scrollTop = chatLog.scrollHeight; // Scroll down

    // 3. Call AI
    const result = await aiChat(prompt);
    
    // 4. Handle response
    loading.remove();
    const reply = result?.text || result?.error || "No response";
    chatLog.insertAdjacentHTML("beforeend", `<div class="p-2 text-white bg-sky-900/60 rounded">${reply}</div>`);
    chatLog.scrollTop = chatLog.scrollHeight; // Scroll to bottom
  });
}

// AI Quote Estimator
const quoteBtn = document.getElementById("quote-btn");
if (quoteBtn) {
  quoteBtn.addEventListener("click", async () => {
    const txt = document.getElementById("quote-input").value.trim();
    if (!txt) return;

    quoteBtn.disabled = true;
    quoteBtn.textContent = "Estimating...";
    const quoteOutput = document.getElementById("quote-output");
    quoteOutput.textContent = "AI is thinking...";

    // This is a much more detailed "system prompt"
    const systemPrompt = `
      You are PratikBot, an expert full-stack developer. 
      A potential client is asking for a quote. 
      Based on their request, provide a *concise* cost and timeline estimate.

      RULES:
      - Start with a single-line summary (e.g., "Estimate: $XXX - $XXXX, 2-4 weeks").
      - Then, add 2-3 bullet points explaining the main tasks.
      - Be friendly, professional, and concise.

      Client Request: "${txt}"
    `;

    const res = await aiChat(systemPrompt);
    
    quoteOutput.textContent = res.text || res.error || "No estimate.";
    quoteBtn.disabled = false;
    quoteBtn.textContent = "Estimate Price";
  });
}


// --------- 6. MOBILE MENU TOGGLE (FOR ALL PAGES) ---------
const mobileToggle = document.getElementById("mobile-toggle");
const mobileMenu = document.getElementById("mobile-menu"); // <-- You need to add id="mobile-menu" to your nav in the HTML

if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}