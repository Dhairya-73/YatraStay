/**
 * Frontend script handling AI chat logic and rendering recommended listings.
 * File: public/js/ai-assistant.js
 */

document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  const sendBtn = document.getElementById("sendBtn");
  
  const summaryBox = document.getElementById("summaryBox");
  const recsPlaceholder = document.getElementById("recsPlaceholder");
  const recsSkeleton = document.getElementById("recsSkeleton");
  const listingsContainer = document.getElementById("listingsContainer");

  // Auto-fill query parameter if redirected from Search Page suggestions
  const urlParams = new URLSearchParams(window.location.search);
  const prefill = urlParams.get("query");
  if (prefill && chatInput && chatForm) {
    chatInput.value = prefill;
    setTimeout(() => {
      chatForm.dispatchEvent(new Event("submit"));
    }, 300);
  }

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const message = chatInput.value.trim();
    if (!message) return;

    // 1. Reset client input state
    chatInput.value = "";
    setControlsDisabled(true);

    // 2. Append user bubble to chat window
    appendChatBubble(message, "user");
    scrollToBottom();

    // 3. Show typing indicator and skeletons loader
    const typingIndicator = appendTypingIndicator();
    scrollToBottom();
    showSkeletons(true);

    try {
      // 4. Send query request to Express API
      const response = await fetch("/ai-assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      // Remove typing bubble
      typingIndicator.remove();

      if (!response.ok) {
        throw new Error(`API responded with status code ${response.status}`);
      }

      const resData = await response.json();

      if (resData.success) {
        const { listings, recommendation } = resData.data;

        // Append AI response text to chat log
        appendChatBubble(recommendation.summary, "ai");
        scrollToBottom();

        // Render listings on the right panel
        renderRecommendations(listings, recommendation);
      } else {
        appendChatBubble("I experienced an issue analyzing the properties. Let's try again with a simpler request.", "ai");
        showErrorPlaceholder(resData.error || "Failed to analyze listings.");
      }
    } catch (err) {
      console.error("[FrontEnd] API request error:", err);
      if (typingIndicator) typingIndicator.remove();
      
      appendChatBubble("Network connection error. Please make sure your server is online and try again.", "ai");
      showErrorPlaceholder("Unable to connect to the AI service. Verify your connection.");
    } finally {
      // Re-enable input controls
      setControlsDisabled(false);
      chatInput.focus();
    }
  });

  // UI State Helpers
  function setControlsDisabled(disabled) {
    chatInput.disabled = disabled;
    sendBtn.disabled = disabled;
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showSkeletons(show) {
    if (show) {
      recsPlaceholder.classList.add("d-none");
      listingsContainer.classList.add("d-none");
      summaryBox.classList.add("d-none");
      recsSkeleton.classList.remove("d-none");
    } else {
      recsSkeleton.classList.add("d-none");
    }
  }

  function appendChatBubble(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender} shadow-sm animate-slide-up`;
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    return bubble;
  }

  function appendTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "typing-indicator shadow-sm";
    indicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(indicator);
    return indicator;
  }

  function showErrorPlaceholder(errorMsg) {
    showSkeletons(false);
    recsPlaceholder.classList.remove("d-none");
    recsPlaceholder.innerHTML = `
      <i class="fa-solid fa-circle-exclamation fa-3x mb-3 text-danger"></i>
      <h5 class="text-danger">Search Error</h5>
      <p class="small text-muted">${errorMsg}</p>
    `;
  }

  // Render hotel cards dynamically
  function renderRecommendations(listings, recommendation) {
    showSkeletons(false);
    
    // 1. Check if we received any candidate listings
    if (!listings || listings.length === 0) {
      summaryBox.classList.add("d-none");
      recsPlaceholder.classList.remove("d-none");
      recsPlaceholder.innerHTML = `
        <i class="fa-solid fa-hotel fa-3x mb-3 text-secondary"></i>
        <h5>No properties found</h5>
        <p class="small text-muted">We couldn't find any stays matching your criteria. Try widening your budget or target location.</p>
      `;
      listingsContainer.innerHTML = "";
      return;
    }

    // 2. Display summary narrative
    summaryBox.textContent = recommendation.summary;
    summaryBox.classList.remove("d-none");
    listingsContainer.classList.remove("d-none");

    // Map recommendation item details by listing ID
    const recsMap = {};
    if (recommendation.recommendations) {
      recommendation.recommendations.forEach(r => {
        recsMap[r.listingId] = r;
      });
    }

    // 3. Build card elements matching global property card design
    let listingsHtml = "";
    listings.forEach(hotel => {
      const recDetails = recsMap[hotel._id];
      
      const reason = recDetails ? recDetails.reason : "Matches location and budget limits.";
      const pros = recDetails && recDetails.pros ? recDetails.pros : [];
      const cons = recDetails && recDetails.cons ? recDetails.cons : [];
      const relevanceExp = recDetails ? recDetails.relevanceExplanation : "Highly aligned with request.";

      // Build pros checkmarks list
      let prosHtml = "";
      if (pros.length > 0) {
        prosHtml = `
          <ul class="list-unstyled mb-2 p-0 small">
            ${pros.map(p => `<li class="text-success" style="font-size:0.8rem; margin-bottom:2px;"><i class="fa-solid fa-circle-check me-1.5"></i>${p}</li>`).join("")}
          </ul>
        `;
      }

      // Build cons red dash list
      let consHtml = "";
      if (cons.length > 0) {
        consHtml = `
          <ul class="list-unstyled mb-0 p-0 small">
            ${cons.map(c => `<li class="text-danger" style="font-size:0.8rem; margin-bottom:2px;"><i class="fa-solid fa-circle-xmark me-1.5"></i>${c}</li>`).join("")}
          </ul>
        `;
      }

      const score = hotel.relevanceScore || 100;
      const imageUrl = hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945";

      listingsHtml += `
        <div class="col-md-6 col-sm-12">
          <div class="property-card h-100 d-flex flex-column animate-slide-up" style="position: relative;">
            
            <!-- Relevance Score Badge -->
            <span class="card-badge-custom badge-match">
              <i class="fa-solid fa-wand-magic-sparkles me-1"></i> Match: ${score}%
            </span>
            
            <div class="card-img-container position-relative overflow-hidden" style="aspect-ratio: 16/10;">
              <img src="${imageUrl}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';" class="w-100 h-100 object-fit-cover" alt="${hotel.name}">
            </div>
            
            <div class="card-body-content p-3 d-flex flex-column flex-grow-1 justify-content-between">
              <div>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h5 class="fw-bold text-dark mb-0 text-truncate" style="max-width: 80%;">${hotel.name}</h5>
                  <span class="card-rating text-dark fw-bold small"><i class="fa-solid fa-star text-warning me-1"></i>4.8</span>
                </div>
                <p class="text-muted mb-2 small"><i class="fa-solid fa-location-dot text-danger me-1"></i>${hotel.location}</p>
                
                <!-- AI Insight Recommendation Box -->
                <div class="ai-insight-box p-2.5 mb-3">
                  <span class="ai-insight-title d-block fw-bold mb-1">
                    <i class="fa-solid fa-wand-magic-sparkles me-1"></i> Yatra Sathi Match Reason
                  </span>
                  <p class="ai-insight-text mb-1">${reason}</p>
                  <small class="text-muted d-block small" style="font-size:0.75rem; line-height:1.3;">${relevanceExp}</small>
                </div>
                
                ${prosHtml}
                ${consHtml}
              </div>
              
              <div class="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
                <span class="card-price fw-bold text-dark fs-6">
                  ₹ ${hotel.price.toLocaleString("en-IN")} <span class="fs-6 text-muted fw-normal">/ night</span>
                </span>
                <a href="/hotels/${hotel._id}" class="btn btn-outline-dark fw-bold rounded-pill px-3 py-1.5" style="font-size: 0.8rem;">
                  View Details
                </a>
              </div>
            </div>
            
          </div>
        </div>
      `;
    });

    listingsContainer.innerHTML = listingsHtml;
  }
});
