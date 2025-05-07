const iframe = document.getElementById('preview');
const fontSizeSelector = document.getElementById('fontSize');
const fontFamilySelector = document.getElementById('fontFamily');
const fontColorPicker = document.getElementById('fontColor');
const lineHeightSelector = document.getElementById('lineHeight');

let allEditableTags = [];
const originalFontSizes = new Map(); // Store original sizes (tag => px number)

// Apply current style settings to all editable tags
function updateStyles() {
  const offset = parseFloat(fontSizeSelector.value);
  const selectedFamily = fontFamilySelector.value;
  const selectedColor = fontColorPicker.value;
  const selectedLineHeight = lineHeightSelector.value;

  allEditableTags.forEach(el => {
    const baseSize = originalFontSizes.get(el);
    if (!baseSize) return;

    const newSize = baseSize + offset;

    el.style.setProperty('font-size', `${newSize}px`, 'important');
    el.style.setProperty('font-family', selectedFamily, 'important');
    el.style.setProperty('color', selectedColor, 'important');
    el.style.setProperty('line-height', selectedLineHeight, 'important');
  });

  // Trigger pagination after styles are applied
  setTimeout(paginatePages, 100);
}

// Paginate the content inside the iframe
function paginatePages() {
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  const wrapper = iframeDoc.getElementById("resumeWrapper");

  if (!wrapper) return;

  const pages = wrapper.querySelectorAll("page");
  const pageHeight = 29.7 * 37.8; // 29.7cm in px

  pages.forEach((page, pageIndex) => {
    const rightPanel = page.querySelector(".rightPanel");

    if (!rightPanel) return;

    while (rightPanel.scrollHeight > rightPanel.clientHeight) {
      const children = Array.from(rightPanel.children);
      if (children.length === 0) break;

      const lastChild = children[children.length - 1];

      // Create new page
      const newPage = page.cloneNode(true);
      const newRightPanel = newPage.querySelector(".rightPanel");
      const newLeftPanel = newPage.querySelector(".leftPanel");

      // Clear panels
      if (newRightPanel) newRightPanel.innerHTML = '';
      if (newLeftPanel) newLeftPanel.innerHTML = ''; // optional: only if left panel content shouldn't repeat

      // Move content
      if (lastChild) newRightPanel.appendChild(lastChild);

      wrapper.appendChild(newPage);
    }
  });
}

// When iframe loads
iframe.addEventListener('load', () => {
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  // Select tags you want to edit
  allEditableTags = Array.from(
    iframeDoc.querySelectorAll('h1, h2, h3, p, span, a, li')
  );

  console.log(`Found ${allEditableTags.length} editable tags.`);

  // Make them editable and store original font size
  allEditableTags.forEach(el => {
    el.contentEditable = true;
    el.style.cursor = 'pointer';

    // Get computed font size (in px), parse it as float
    const computedSize = parseFloat(
      iframeDoc.defaultView.getComputedStyle(el).fontSize
    );

    if (!isNaN(computedSize)) {
      originalFontSizes.set(el, computedSize);
    }
  });

  // Attach toolbar handlers
  fontSizeSelector.addEventListener('change', updateStyles);
  fontFamilySelector.addEventListener('change', updateStyles);
  fontColorPicker.addEventListener('input', updateStyles);
  lineHeightSelector.addEventListener('change', updateStyles);
});
