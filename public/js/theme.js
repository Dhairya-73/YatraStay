/**
 * Site-wide theme toggle, wishlist collections, and recently viewed stays manager.
 * File: public/js/theme.js
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Dark Mode Toggle Initialization
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const currentTheme = localStorage.getItem("theme") || "light";

  // Apply saved theme state on mount
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  }

  // Toggle Theme Listener
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      let theme = document.documentElement.getAttribute("data-theme");
      if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
      }
    });
  }

  // 2. Client-Side Wishlist Toggle (Local Storage Grounded)
  const wishlistButtons = document.querySelectorAll(".wishlist-btn");
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  // Update heart active states on page load
  wishlistButtons.forEach(btn => {
    const hotelId = btn.getAttribute("data-hotel-id");
    if (wishlist.includes(hotelId)) {
      btn.classList.add("active");
      btn.querySelector("i").className = "fa-solid fa-heart";
    }
  });

  // Handle wishlist button clicks
  wishlistButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const hotelId = btn.getAttribute("data-hotel-id");
      const icon = btn.querySelector("i");
      
      // Perform scale-bounce animation
      btn.style.transform = "scale(1.3)";
      setTimeout(() => {
        btn.style.transform = "";
      }, 150);

      if (wishlist.includes(hotelId)) {
        // Remove from wishlist
        wishlist = wishlist.filter(id => id !== hotelId);
        btn.classList.remove("active");
        icon.className = "fa-regular fa-heart";
        showToast("Removed from wishlist");
      } else {
        // Add to wishlist
        wishlist.push(hotelId);
        btn.classList.add("active");
        icon.className = "fa-solid fa-heart";
        showToast("Added to wishlist");
      }
      
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    });
  });

  // 3. Recently Viewed Logger (Only runs on detail pages)
  const detailPageEl = document.getElementById("hotelDetailMarker");
  if (detailPageEl) {
    const hotelId = detailPageEl.getAttribute("data-hotel-id");
    const hotelName = detailPageEl.getAttribute("data-hotel-name");
    const hotelLocation = detailPageEl.getAttribute("data-hotel-location");
    const hotelPrice = detailPageEl.getAttribute("data-hotel-price");
    const hotelImage = detailPageEl.getAttribute("data-hotel-image");

    if (hotelId) {
      let recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
      
      // Filter out existing duplicates
      recentlyViewed = recentlyViewed.filter(item => item.id !== hotelId);
      
      // Append latest item to top
      recentlyViewed.unshift({
        id: hotelId,
        name: hotelName,
        location: hotelLocation,
        price: hotelPrice,
        image: hotelImage
      });

      // Keep only the latest 4 items
      if (recentlyViewed.length > 4) {
        recentlyViewed.pop();
      }

      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    }
  }

  // 4. Render Recently Viewed Stays on Homepage
  const recentStaysContainer = document.getElementById("recentStaysContainer");
  if (recentStaysContainer) {
    const recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    
    if (recentlyViewed.length > 0) {
      document.getElementById("recentSection").classList.remove("d-none");
      
      let html = "";
      recentlyViewed.forEach(hotel => {
        html += `
          <div class="col-md-3 col-sm-6">
            <div class="property-card">
              <div class="card-img-container">
                <button class="wishlist-btn" data-hotel-id="${hotel.id}">
                  <i class="fa-regular fa-heart"></i>
                </button>
                <img src="${hotel.image}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';" loading="lazy" alt="${hotel.name}">
              </div>
              <div class="card-body-content">
                <div>
                  <h6 class="fw-bold mb-1 text-truncate">${hotel.name}</h6>
                  <p class="text-muted small mb-2"><i class="fa-solid fa-location-dot text-danger"></i> ${hotel.location}</p>
                </div>
                <div class="d-flex align-items-center justify-content-between mt-2">
                  <span class="card-price">₹ ${hotel.price}</span>
                  <a href="/hotels/${hotel.id}" class="btn btn-sm btn-outline-dark">View</a>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      recentStaysContainer.innerHTML = html;

      // Re-trigger wishlist listeners for dynamically injected cards
      bindDynamicWishlists();
    }
  }

  // Dynamic Wishlist Binding helper
  function bindDynamicWishlists() {
    const dynButtons = recentStaysContainer.querySelectorAll(".wishlist-btn");
    dynButtons.forEach(btn => {
      const hotelId = btn.getAttribute("data-hotel-id");
      if (wishlist.includes(hotelId)) {
        btn.classList.add("active");
        btn.querySelector("i").className = "fa-solid fa-heart";
      }

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.style.transform = "scale(1.3)";
        setTimeout(() => btn.style.transform = "", 150);
        
        let wl = JSON.parse(localStorage.getItem("wishlist")) || [];
        const icon = btn.querySelector("i");

        if (wl.includes(hotelId)) {
          wl = wl.filter(id => id !== hotelId);
          btn.classList.remove("active");
          icon.className = "fa-regular fa-heart";
          showToast("Removed from wishlist");
        } else {
          wl.push(hotelId);
          btn.classList.add("active");
          icon.className = "fa-solid fa-heart";
          showToast("Added to wishlist");
        }
        localStorage.setItem("wishlist", JSON.stringify(wl));
      });
    });
  }

  // Elegant Toast Notification System
  function showToast(message) {
    // Create toast element container if not already exists
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toastContainer";
      toastContainer.style.position = "fixed";
      toastContainer.style.bottom = "24px";
      toastContainer.style.left = "24px";
      toastContainer.style.zIndex = "9999";
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = "alert alert-dark text-white border-0 shadow-lg px-4 py-2 m-0 mt-2";
    toast.style.borderRadius = "8px";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    toast.style.transition = "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
    toast.style.background = "#0F172A";
    toast.innerHTML = `<i class="fa-solid fa-info-circle text-warning me-2"></i> ${message}`;

    toastContainer.appendChild(toast);

    // Trigger transition Reflow
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }, 10);

    // Fade out and remove toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
});
