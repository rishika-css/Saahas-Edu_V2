import { useEffect } from "react";
import { useAccessibility } from "../context/AccessibilityContext";

function FocusTileOverlay() {
  const { adhdFocus } = useAccessibility();

  useEffect(() => {
    if (!adhdFocus) {
      // Clean up any blur when mode is off
      document.querySelectorAll("[data-adhd-blurred]").forEach((el) => {
        el.style.filter = "";
        el.style.opacity = "";
        el.style.transition = "";
        el.removeAttribute("data-adhd-blurred");
      });
      return;
    }

    const handleMouseOver = (e) => {
      // Get all direct children of body and main containers
      const focusableElements = document.querySelectorAll(
        ".card, .btn-primary, .btn-secondary, input, button, [class*='card'], p, h1, h2, h3, label, select"
      );

      focusableElements.forEach((el) => {
        if (el.contains(e.target) || el === e.target) {
          // This element or its parent is hovered — clear blur
          el.style.filter = "none";
          el.style.opacity = "1";
          el.style.transition = "filter 0.2s, opacity 0.2s";
          el.removeAttribute("data-adhd-blurred");
        } else {
          // Not hovered — blur it
          el.style.filter = "blur(3px)";
          el.style.opacity = "0.4";
          el.style.transition = "filter 0.2s, opacity 0.2s";
          el.setAttribute("data-adhd-blurred", "true");
        }
      });
    };

    const handleMouseOut = () => {
      // When mouse leaves an element, gently re-blur everything
      const focusableElements = document.querySelectorAll(
        ".card, .btn-primary, .btn-secondary, input, button, [class*='card'], p, h1, h2, h3, label, select"
      );
      focusableElements.forEach((el) => {
        el.style.filter = "blur(3px)";
        el.style.opacity = "0.4";
        el.setAttribute("data-adhd-blurred", "true");
      });
    };

    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      // Clean up on unmount
      document.querySelectorAll("[data-adhd-blurred]").forEach((el) => {
        el.style.filter = "";
        el.style.opacity = "";
        el.removeAttribute("data-adhd-blurred");
      });
    };
  }, [adhdFocus]);

  return null; // No DOM overlay needed anymore
}

export default FocusTileOverlay;