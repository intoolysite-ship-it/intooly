// intooly Common JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.toLowerCase().trim();
                if (!query) return;
                
                const searchMap = {
                    'خلفية': 'background-remover.html',
                    'ازالة': 'background-remover.html',
                    'إزالة': 'background-remover.html',
                    'ضغط': 'image-compressor.html',
                    'صور': 'image-compressor.html',
                    'فيديو': 'video-compressor.html',
                    'تحويل': 'video-converter.html',
                    'قص': 'video-trimmer.html',
                    'gif': 'video-to-gif.html',
                    'صوت': 'video-to-mp3.html',
                    'mp3': 'video-to-mp3.html',
                    'منتج': 'product-photo-studio.html',
                    'أمازون': 'product-photo-studio.html',
                    'نون': 'product-photo-studio.html',
                };
                
                for (const [key, url] of Object.entries(searchMap)) {
                    if (query.includes(key)) {
                        window.location.href = url;
                        return;
                    }
                }
                alert('لم يتم العثور على نتائج. جرّب: خلفية، ضغط، فيديو');
            }
        });
    }
});