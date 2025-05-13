document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[action="upload.php"]');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const fileInput = document.getElementById('file');
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        fetch('upload.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            alert('Upload failed.');
        });
    });
});
