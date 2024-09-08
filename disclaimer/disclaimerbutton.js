
// Toggle Disclaimer Content
document.getElementById('disclaimerButton').addEventListener('click', function() {
    const disclaimerContent = document.getElementById('disclaimerContent');
    disclaimerContent.classList.toggle('hidden');
    if (!disclaimerContent.classList.contains('hidden')) {
        disclaimerContent.classList.remove('translate-y-full');
        disclaimerContent.classList.add('translate-y-0');
    } else {
        disclaimerContent.classList.add('translate-y-full');
        disclaimerContent.classList.remove('translate-y-0');
    }
});

// Close Disclaimer
document.getElementById('closeDisclaimer').addEventListener('click', function() {
    const disclaimerContent = document.getElementById('disclaimerContent');
    disclaimerContent.classList.add('hidden');
    disclaimerContent.classList.add('translate-y-full');
    disclaimerContent.classList.remove('translate-y-0');
});
