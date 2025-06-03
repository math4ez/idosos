const firebaseConfig = {
    apiKey: "AIzaSyBuO53NnPABPPNvoJwVd0Cf-uHdhjvp4ek",
    authDomain: "quiz-b1a5f.firebaseapp.com",
    projectId: "quiz-b1a5f",
    storageBucket: "quiz-b1a5f.firebasbasestorage.app",
    messagingSenderId: "766849360617",
    appId: "1:766849360617:web:d4bb2f95268a31d74e8678"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const postBtn = document.getElementById('postBtn');
const postContent = document.getElementById('postContent');
const feedSection = document.getElementById('feedSection');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewImg = imagePreview ? imagePreview.querySelector('img') : null;
const removeImageBtn = document.getElementById('removeImageBtn');

const profileUsernameSpan = document.getElementById('profileUsername');
const logoutBtn = document.getElementById('logoutBtn');
const loadingMessage = document.getElementById('loadingMessage');

const editPostModal = document.getElementById('editPostModal');
const closeEditModalBtn = document.getElementById('closeEditModal');
const editPostContent = document.getElementById('editPostContent');
const saveEditedPostBtn = document.getElementById('saveEditedPostBtn');

const notificationContainer = document.getElementById('notificationContainer');

const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const closeConfirmModalBtn = document.getElementById('closeConfirmModal');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');

const searchContainer = document.querySelector('.search-container');
const toggleSearchBtn = document.getElementById('toggleSearchBtn');
const searchInput = document.getElementById('searchInput');
const executeSearchBtn = document.getElementById('executeSearchBtn');
const searchMessage = document.getElementById('searchMessage');
const homeLink = document.getElementById('homeLink');

let currentUser = null;
let userProfile = null;
let selectedImageBase64 = null;
let editingPostId = null;

let openOptionsMenu = null;
let confirmCallback = null;

let currentSearchTerm = '';

const showNotification = (message, type = 'info', duration = 3000) => {
    const notification = document.createElement('div');
    notification.classList.add('notification-message');
    notification.textContent = message;

    if (type === 'error') {
        notification.classList.add('error');
    } else if (type === 'success') {
        notification.classList.add('success');
    }

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 50);

    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        notification.addEventListener('transitionend', () => {
            notification.remove();
        }, { once: true });
    }, duration);
};

const showConfirmModal = (message, onConfirmCallback) => {
    confirmMessage.textContent = message;
    confirmModal.style.display = 'flex';
    confirmCallback = onConfirmCallback;

    confirmYesBtn.onclick = null;
    confirmNoBtn.onclick = null;
    closeConfirmModalBtn.onclick = null;

    confirmYesBtn.onclick = () => {
        confirmModal.style.display = 'none';
        if (confirmCallback) {
            confirmCallback(true);
        }
    };

    confirmNoBtn.onclick = () => {
        confirmModal.style.display = 'none';
        if (confirmCallback) {
            confirmCallback(false);
        }
    };

    closeConfirmModalBtn.onclick = () => {
        confirmModal.style.display = 'none';
        if (confirmCallback) {
            confirmCallback(false);
        }
    };
};


const formatPostDate = (timestamp) => {
    if (!timestamp) return 'Data Indisponível';

    let date;

    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
    } else if (typeof timestamp === 'string' && !isNaN(new Date(timestamp))) {
        date = new Date(timestamp);
    } else {
        date = new Date();
    }

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 5) {
        return 'Agora';
    } else if (diffMinutes < 60) {
        return `há ${diffMinutes} min`;
    } else if (diffHours < 24) {
        return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
        return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('pt-BR', options);
    }
};

const getFirstName = (nameOrEmail) => {
    if (!nameOrEmail) return '';

    if (typeof nameOrEmail === 'string' && nameOrEmail.includes('@')) {
        return nameOrEmail.split('@')[0];
    } else if (typeof nameOrEmail === 'string') {
        const parts = nameOrEmail.split(' ');
        return parts[0];
    }
    return '';
};

const createPostCard = (postData) => {
    const postCard = document.createElement('div');
    postCard.classList.add('post-card');
    postCard.dataset.postId = postData.id;

    const displayName = getFirstName(postData.authorName) || 'Usuário Desconhecido';
    const displayDate = formatPostDate(postData.timestamp);

    const postImageHtml = postData.imageBase64 ? `<img src="${postData.imageBase64}" alt="Post image" class="post-image">` : '';

    let optionsMenuHtml = '';
    if (currentUser && currentUser.uid === postData.authorId) {
        optionsMenuHtml = `
            <div class="options-container">
                <button class="options-button"><i class="fas fa-ellipsis-h"></i></button>
                <div class="options-menu" data-post-id="${postData.id}">
                    <button class="edit-btn"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-btn"><i class="fas fa-trash"></i> Excluir</button>
                </div>
            </div>
        `;
    }

    const hasLiked = currentUser && postData.likedBy && postData.likedBy.includes(currentUser.uid);
    const likeBtnClass = hasLiked ? 'post-action-btn like-btn liked' : 'post-action-btn like-btn';
    const likeBtnStyle = hasLiked ? 'color: var(--primary-color);' : '';
    const likesCount = postData.likes !== undefined ? postData.likes : 0; 

    postCard.innerHTML = `
        <div class="post-header">
            <div class="user-info-and-date">
                <div class="user-info">
                    <i class="fas fa-user-circle user-avatar"></i>
                    <span class="username">${displayName}</span>
                </div>
                <span class="post-date">${displayDate}</span>
            </div>
            ${optionsMenuHtml}
        </div>
        <div class="post-content">
            <p>${postData.content}</p>
            ${postImageHtml}
        </div>
        <div class="post-footer">
            <button class="${likeBtnClass}" style="${likeBtnStyle}" data-post-id="${postData.id}">
                <i class="fas fa-thumbs-up"></i> <span class="likes-count">${likesCount}</span> Curtir
            </button>
            <button class="post-action-btn repost-btn"><i class="fas fa-share"></i> Compartilhar</button>
        </div>
    `;
    return postCard;
};

const fetchPosts = async (searchTerm = '') => {
    loadingMessage.style.display = 'block';
    feedSection.innerHTML = '';
    searchMessage.style.display = 'none';

    try {
        let postsRef = db.collection('posts');

        postsRef = postsRef.orderBy('timestamp', 'desc');
        const snapshot = await postsRef.get();

        let filteredPosts = [];
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            snapshot.forEach(doc => {
                const postData = doc.data();
                if (postData.content && postData.content.toLowerCase().includes(lowerCaseSearchTerm)) {
                    postData.id = doc.id;
                    postData.likes = postData.likes || 0;
                    postData.likedBy = postData.likedBy || [];
                    filteredPosts.push(postData);
                }
            });
        } else {
            snapshot.forEach(doc => {
                const postData = doc.data();
                postData.id = doc.id;
                postData.likes = postData.likes || 0;
                postData.likedBy = postData.likedBy || [];
                filteredPosts.push(postData);
            });
        }

        if (filteredPosts.length === 0) {
            let message = '';
            if (searchTerm) {
                message = `Nenhum resultado encontrado para "${searchTerm}".`;
                searchMessage.textContent = message;
                searchMessage.style.display = 'block';
            } else {
                message = 'Nenhuma postagem encontrada ainda. Seja o primeiro a compartilhar!';
            }
            feedSection.innerHTML = `<div class="loading-message">${message}</div>`;
            return;
        }

        filteredPosts.forEach(postData => {
            const newPostCard = createPostCard(postData);
            feedSection.appendChild(newPostCard);
        });

        if (searchTerm && filteredPosts.length > 0) {
            searchMessage.textContent = `Resultados da pesquisa para "${searchTerm}" (${filteredPosts.length} postagens).`;
            searchMessage.style.display = 'block';
        }

    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        showNotification("Erro ao carregar posts. Tente novamente mais tarde.", "error");
        feedSection.innerHTML = '<div class="loading-message" style="color: red;">Erro ao carregar posts. Tente novamente mais tarde.</div>';
    } finally {
        loadingMessage.style.display = 'none';
    }
};


auth.onAuthStateChanged(async (user) => {
    currentUser = user;

    if (currentUser) {
        logoutBtn.style.display = 'block';
        console.log("Usuário logado:", currentUser.uid);

        try {
            const userDoc = await db.collection('usuarios').doc(currentUser.uid).get();
            if (userDoc.exists) {
                userProfile = userDoc.data();
                profileUsernameSpan.textContent = getFirstName(userProfile.nomeCompleto) || getFirstName(currentUser.email) || 'Meu Perfil';
                console.log("Perfil do usuário carregado:", userProfile);
            } else {
                console.warn("Nenhum perfil encontrado na coleção 'usuarios' para o UID:", currentUser.uid);
                profileUsernameSpan.textContent = getFirstName(currentUser.email) || 'Meu Perfil';
            }
        } catch (error) {
            console.error("Erro ao buscar perfil do usuário:", error);
            showNotification("Erro ao carregar seu perfil.", "error");
            profileUsernameSpan.textContent = getFirstName(currentUser.email) || 'Meu Perfil';
        }

        fetchPosts();
    } else {
        currentUser = null;
        userProfile = null;
        logoutBtn.style.display = 'none';
        profileUsernameSpan.textContent = 'Perfil';
        feedSection.innerHTML = '<div class="loading-message">Por favor, faça login para ver e criar postagens.</div>';
        fetchPosts(); 
    }
});

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const MAX_FILE_SIZE_KB = 200;
        if (file.size > MAX_FILE_SIZE_KB * 1024) {
            showNotification(`A imagem é muito grande. Por favor, selecione uma imagem menor que ${MAX_FILE_SIZE_KB}KB.`, "error");
            event.target.value = '';
            selectedImageBase64 = null;
            if (imagePreview) imagePreview.style.display = 'none';
            if (imagePreviewImg) imagePreviewImg.src = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            selectedImageBase64 = e.target.result;
            if (imagePreviewImg) {
                imagePreviewImg.src = selectedImageBase64;
                imagePreview.style.display = 'flex';
            }
        };
        reader.readAsDataURL(file);
    } else {
        selectedImageBase64 = null;
        if (imagePreview) imagePreview.style.display = 'none';
        if (imagePreviewImg) imagePreviewImg.src = '';
    }
});

if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
        selectedImageBase64 = null;
        if (imageUpload) imageUpload.value = '';
        if (imagePreview) imagePreview.style.display = 'none';
        if (imagePreviewImg) imagePreviewImg.src = '';
    });
}

postBtn.addEventListener('click', async () => {
    if (!currentUser) {
        showNotification('Você precisa estar logado para fazer uma postagem.', "info");
        return;
    }

    const content = postContent.value.trim();

    if (content || selectedImageBase64) {
        try {
            let authorDisplayName = 'Usuário Desconhecido';
            if (userProfile && userProfile.nomeCompleto) {
                authorDisplayName = userProfile.nomeCompleto;
            } else if (currentUser.email) {
                authorDisplayName = getFirstName(currentUser.email);
            } else if (currentUser.displayName) {
                authorDisplayName = currentUser.displayName;
            }

            const newPost = {
                authorId: currentUser.uid,
                authorName: authorDisplayName,
                content: content,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0, 
                likedBy: [], 
                imageBase64: selectedImageBase64
            };

            selectedImageBase64 = null;
            if (imageUpload) imageUpload.value = '';
            if (imagePreview) imagePreview.style.display = 'none';
            if (imagePreviewImg) imagePreviewImg.src = '';

            await db.collection('posts').add(newPost);
            console.log("Postagem salva com sucesso!");
            showNotification("Postagem criada com sucesso!", "success");
            postContent.value = '';
            fetchPosts(currentSearchTerm); 

        } catch (error) {
            console.error("Erro ao salvar postagem:", error);
            showNotification("Erro ao salvar postagem. Tente novamente.", "error");
            loadingMessage.style.display = 'none';
        }
    } else {
        showNotification('Por favor, escreva algo ou selecione uma imagem para postar.', "info");
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        showNotification('Você foi desconectado.', "success");

    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        showNotification('Erro ao fazer logout. Tente novamente.', "error");
    }
});

toggleSearchBtn.addEventListener('click', () => {
    searchContainer.classList.toggle('expanded');
    if (searchContainer.classList.contains('expanded')) {
        searchInput.focus(); 
    } else {
        if (currentSearchTerm || searchInput.value) {
            currentSearchTerm = '';
            searchInput.value = '';
            fetchPosts(); 
            searchMessage.style.display = 'none';
        }
    }
});

executeSearchBtn.addEventListener('click', () => {
    currentSearchTerm = searchInput.value.trim();
    fetchPosts(currentSearchTerm);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        executeSearchBtn.click();
    }
});


homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentSearchTerm !== '' || searchInput.value !== '' || searchContainer.classList.contains('expanded')) {
        currentSearchTerm = '';
        searchInput.value = '';
        searchContainer.classList.remove('expanded'); 
        fetchPosts();
        searchMessage.style.display = 'none';
        showNotification('Pesquisa resetada. Mostrando todos os posts.', 'info');
    }
});


feedSection.addEventListener('click', async (event) => {
    const postCard = event.target.closest('.post-card');
    if (!postCard) return;

    const postId = postCard.dataset.postId;
    if (!postId) {
        console.warn("Post ID não encontrado para esta postagem.");
        return;
    }

    if (event.target.closest('.like-btn')) {
        if (!currentUser) {
            showNotification('Você precisa estar logado para curtir.', "info");
            return;
        }

        const likeButton = event.target.closest('.like-btn');
        const likesCountSpan = likeButton.querySelector('.likes-count');

        try {
            const postRef = db.collection('posts').doc(postId);
            const postDoc = await postRef.get();

            if (!postDoc.exists) {
                showNotification('Postagem não encontrada.', "error");
                return;
            }

            const postData = postDoc.data();
            let likedBy = postData.likedBy || []; 
            let likes = postData.likes || 0;    

            if (likedBy.includes(currentUser.uid)) {
                likedBy = likedBy.filter(uid => uid !== currentUser.uid);
                likes = Math.max(0, likes - 1); 
                likeButton.classList.remove('liked');
                likeButton.style.color = ''; 
                showNotification('Você descurtiu esta postagem.', "info");
            } 
            else {
                likedBy.push(currentUser.uid);
                likes = likes + 1;
                likeButton.classList.add('liked');
                likeButton.style.color = 'var(--primary-color)'; 
                showNotification('Você curtiu esta postagem!', "success");
            }

            await postRef.update({
                likes: likes,
                likedBy: likedBy
            });

            likesCountSpan.textContent = likes;

        } catch (error) {
            console.error("Erro ao atualizar curtida:", error);
            showNotification('Erro ao processar curtida. Tente novamente.', "error");
        }

    } else if (event.target.closest('.repost-btn')) {
        if (!currentUser) {
            showNotification('Você precisa estar logado para compartilhar.', "info");
            return;
        }
        showNotification('Compartilhar postagem (funcionalidade em desenvolvimento)!', "info");
    } else if (event.target.closest('.options-button')) {
        const optionsMenu = postCard.querySelector('.options-menu');

        if (openOptionsMenu && openOptionsMenu !== optionsMenu) {
            openOptionsMenu.classList.remove('active');
        }

        optionsMenu.classList.toggle('active');
        openOptionsMenu = optionsMenu.classList.contains('active') ? optionsMenu : null;

        event.stopPropagation();

    } else if (event.target.closest('.edit-btn')) {
        if (!currentUser) {
            showNotification('Você precisa estar logado para editar.', "info");
            return;
        }
        if (openOptionsMenu) {
            openOptionsMenu.classList.remove('active');
            openOptionsMenu = null;
        }

        const postParagraph = postCard.querySelector('.post-content p');
        if (postParagraph) {
            editPostContent.value = postParagraph.textContent;
            editingPostId = postId;
            editPostModal.style.display = 'flex';
        }
    } else if (event.target.closest('.delete-btn')) {
        if (!currentUser) {
            showNotification('Você precisa estar logado para excluir.', "info");
            return;
        }

        showConfirmModal('Tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita.', async (confirmed) => {
            if (confirmed) {
                try {
                    const postDoc = await db.collection('posts').doc(postId).get();
                    if (postDoc.exists && postDoc.data().authorId === currentUser.uid) {
                        await db.collection('posts').doc(postId).delete();
                        showNotification('Postagem excluída com sucesso!', "success");
                        fetchPosts(currentSearchTerm);
                    } else {
                        showNotification('Você não tem permissão para excluir esta postagem.', "error");
                    }
                } catch (error) {
                    console.error("Erro ao excluir postagem:", error);
                    showNotification('Erro ao excluir postagem. Tente novamente.', "error");
                }
            } else {
                showNotification('Exclusão cancelada.', "info");
            }
        });
    }
});

closeEditModalBtn.addEventListener('click', () => {
    editPostModal.style.display = 'none';
    editingPostId = null;
    editPostContent.value = '';
});

saveEditedPostBtn.addEventListener('click', async () => {
    if (!editingPostId) return;

    const updatedContent = editPostContent.value.trim();

    if (updatedContent) {
        try {
            await db.collection('posts').doc(editingPostId).update({
                content: updatedContent,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            showNotification('Postagem atualizada com sucesso!', "success");
            editPostModal.style.display = 'none';
            editingPostId = null;
            editPostContent.value = '';
            fetchPosts(currentSearchTerm);
        } catch (error) {
            console.error("Erro ao atualizar postagem:", error);
            showNotification('Erro ao atualizar postagem. Tente novamente.', "error");
        }
    } else {
        showNotification('O conteúdo da postagem não pode ser vazio.', "info");
    }
});

window.addEventListener('click', (event) => {
    if (event.target === editPostModal) {
        editPostModal.style.display = 'none';
        editingPostId = null;
        editPostContent.value = '';
    }

    if (event.target === confirmModal) {
        confirmModal.style.display = 'none';
        if (confirmCallback) {
            confirmCallback(false);
            confirmCallback = null;
        }
    }

    if (openOptionsMenu && !event.target.closest('.options-container')) {
        openOptionsMenu.classList.remove('active');
        openOptionsMenu = null;
    }

    if (searchContainer.classList.contains('expanded') && !searchContainer.contains(event.target) && event.target !== homeLink) {
        if (searchInput.value.trim() === '' || searchInput.value.trim() === currentSearchTerm) {
            searchContainer.classList.remove('expanded');
        }
    }
});