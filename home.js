document.addEventListener("DOMContentLoaded", () => {
    // Verifica se o usuário está logado
    const usuarioLogado = localStorage.getItem("usuarioLogado");
  
    // Se a variável 'usuarioLogado' não for 'true', redireciona para a página index.html
    if (usuarioLogado !== "true") {
      window.location.href = "index.html";
    }
  
    // O restante do código da página "home.html" aqui (deixa tudo como está)
    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("theme");
  
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  
    // Continue com o restante do código da home...
  });


document.addEventListener('DOMContentLoaded', function() {
	// ============ MENU MOBILE ============
	const menuBtn = document.getElementById('menu-mobile');
	const menu = document.getElementById('menu');

	if (menuBtn && menu) {
		menuBtn.addEventListener('click', function() {
			const isExpanded = this.getAttribute('aria-expanded') === 'true';
			this.setAttribute('aria-expanded', !isExpanded);
			menu.classList.toggle('ativo');
		});

		// Fechar menu ao clicar em um link
		const menuLinks = document.querySelectorAll('#menu a');
		menuLinks.forEach(link => {
			link.addEventListener('click', function() {
				menuBtn.setAttribute('aria-expanded', 'false');
				menu.classList.remove('ativo');
			});
		});
	}

	// ============ ACCORDION DE DICAS ============
	const dicasTitulos = document.querySelectorAll('.dica-titulo');

	dicasTitulos.forEach(titulo => {
		titulo.addEventListener('click', function() {
			const dica = this.parentElement;
			const isExpanded = this.getAttribute('aria-expanded') === 'true';
			this.setAttribute('aria-expanded', !isExpanded);
			dica.classList.toggle('ativo');

			// Fechar outras dicas abertas
			dicasTitulos.forEach(outroTitulo => {
				if (outroTitulo !== this) {
					outroTitulo.setAttribute('aria-expanded', 'false');
					outroTitulo.parentElement.classList.remove('ativo');
				}
			});
		});
	});

	// ============ BOTÃO VOLTAR AO TOPO ============
	const btnTopo = document.getElementById('btn-topo');

	if (btnTopo) {
		window.addEventListener('scroll', function() {
			if (window.pageYOffset > 300) {
				btnTopo.classList.add('visivel');
			} else {
				btnTopo.classList.remove('visivel');
			}
		});

		btnTopo.addEventListener('click', function() {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		});
	}

/*
	esta parte estava interferindo com o formspree
    
	// ============ FORMULÁRIO DE CONTATO ============
	const formContato = document.getElementById('form-contato');

	if (formContato) {
		formContato.addEventListener('submit', function(e) {
			e.preventDefault();

			// Validação simples
			const nome = document.getElementById('nome')?.value.trim();
			const email = document.getElementById('email')?.value.trim();
			const mensagem = document.getElementById('mensagem')?.value.trim();

			if (!nome || !email || !mensagem) {
				alert('Por favor, preencha todos os campos obrigatórios.');
				return;
			}

			// Simulação de envio
			alert(`Obrigado, ${nome}! Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.`);

			// Limpar formulário
			this.reset();
		});
	}
*/

	// ============ MODAL DE CURSOS ============
	const botoesCurso = document.querySelectorAll('.btn-curso');
	const modal = document.getElementById('modal-curso');
	const modalTitulo = document.getElementById('modal-titulo');
	const modalConteudo = document.getElementById('modal-conteudo');
	const modalInscrever = document.getElementById('modal-inscrever');

	if (modal && modalTitulo && modalConteudo && modalInscrever) {
		botoesCurso.forEach(botao => {
			botao.addEventListener('click', function() {
				const curso = this.closest('.curso');
				if (!curso) return;

				const titulo = curso.querySelector('h3')?.textContent || 'Curso';
				const descricao = curso.querySelector('p')?.textContent || '';

				modalTitulo.textContent = titulo;

				// Conteúdo do modal
				let conteudoHTML = `
                    <p>${descricao}</p>
                    <h4>Conteúdo do curso:</h4>
                    <ul>
                        <li>Aulas práticas e didáticas</li>
                        <li>Material de apoio exclusivo</li>
                        <li>Suporte para dúvidas</li>
                        <li>Certificado de conclusão</li>
                    </ul>
                `;

				const duracao = curso.querySelector('.fa-clock')?.parentElement?.textContent.trim();
				if (duracao) {
					conteudoHTML += `<p><strong>Duração:</strong> ${duracao}</p>`;
				}

				modalConteudo.innerHTML = conteudoHTML;

				// Configurar botão de inscrição
				modalInscrever.onclick = function() {
					window.location.href = '#contato';
					modal.classList.remove('ativo');
					const assuntoInput = document.getElementById('assunto');
					const mensagemInput = document.getElementById('mensagem');

					if (assuntoInput) assuntoInput.value = 'matricula';
					if (mensagemInput) mensagemInput.value = `Gostaria de me inscrever no curso ${titulo}`;
				};

				// Mostrar modal
				modal.classList.add('ativo');
			});
		});

		// Fechar modal
		const modalFechar = document.querySelector('.modal-fechar');
		if (modalFechar) {
			modalFechar.addEventListener('click', function() {
				modal.classList.remove('ativo');
			});
		}

		// Fechar modal ao clicar fora
		modal.addEventListener('click', function(e) {
			if (e.target === this) {
				modal.classList.remove('ativo');
			}
		});
	}

	// ============ CARROSSEL DE NOVIDADES ============
	setupCarrossel({
		carrosselSelector: '.novidades-carrossel',
		itemSelector: '.novidade',
		intervalo: 5000,
		controlesSelector: '.novidades-carrossel + .carrossel-controles'
	});

	// ============ CARROSSEL DE DEPOIMENTOS ============
	setupCarrossel({
		carrosselSelector: '.depoimentos-carrossel',
		itemSelector: '.depoimento',
		intervalo: 7000,
		controlesSelector: '.depoimentos-carrossel + .carrossel-controles'
	});

	// Carrossel inicio
	setupCarrossel({
		carrosselSelector: '.recursos-carrossel',
		itemSelector: '.recurso-mini',
		intervalo: 6000,
		controlesSelector: '.recursos-box .carrossel-controles'
	});

	// ============ FUNÇÃO REUTILIZÁVEL PARA CARROSSÉIS ============
	function setupCarrossel({
		carrosselSelector,
		itemSelector,
		intervalo,
		controlesSelector
	}) {
		const carrossel = document.querySelector(carrosselSelector);
		if (!carrossel) return;

		const items = document.querySelectorAll(`${carrosselSelector} ${itemSelector}`);
		if (items.length === 0) return;

		const controlesContainer = document.querySelector(controlesSelector);
		if (!controlesContainer) return;

		let currentIndex = 0;
		let carrosselInterval;
		let indicadores = [];

		// Cria indicadores
		const indicadoresContainer = controlesContainer.querySelector('.carrossel-indicadores') ||
			document.createElement('div');
		if (!controlesContainer.querySelector('.carrossel-indicadores')) {
			indicadoresContainer.classList.add('carrossel-indicadores');
			controlesContainer.insertBefore(indicadoresContainer, controlesContainer.querySelector('.carrossel-next'));
		}

		indicadoresContainer.innerHTML = '';
		items.forEach((_, index) => {
			const indicador = document.createElement('button');
			indicador.setAttribute('aria-label', `Slide ${index + 1}`);
			indicador.setAttribute('data-index', index);
			indicador.classList.add('carrossel-indicador');
			if (index === 0) indicador.classList.add('ativo');
			indicador.addEventListener('click', () => {
				goToSlide(index);
				resetInterval();
			});
			indicadoresContainer.appendChild(indicador);
			indicadores.push(indicador);
		});

		// Função para mudar slide
		function goToSlide(index) {
			items[currentIndex].classList.remove('ativo');
			indicadores[currentIndex]?.classList.remove('ativo');

			currentIndex = (index + items.length) % items.length;

			items[currentIndex].classList.add('ativo');
			indicadores[currentIndex]?.classList.add('ativo');
		}

		// Controles de navegação
		const nextBtn = controlesContainer.querySelector('.carrossel-next');
		const prevBtn = controlesContainer.querySelector('.carrossel-prev');

		if (nextBtn) {
			nextBtn.addEventListener('click', () => {
				goToSlide(currentIndex + 1);
				resetInterval();
			});
		}

		if (prevBtn) {
			prevBtn.addEventListener('click', () => {
				goToSlide(currentIndex - 1);
				resetInterval();
			});
		}

		// Inicia o auto-rotacionar
		startInterval();

		// Pausar ao interagir
		carrossel.addEventListener('mouseenter', () => {
			clearInterval(carrosselInterval);
		});

		carrossel.addEventListener('mouseleave', () => {
			startInterval();
		});

		// Funções auxiliares do carrossel
		function startInterval() {
			carrosselInterval = setInterval(() => {
				goToSlide(currentIndex + 1);
			}, intervalo);
		}

		function resetInterval() {
			clearInterval(carrosselInterval);
			startInterval();
		}
	}

	// ============ ACESSIBILIDADE ============
	// Aumentar Fonte
	const aumentarFonteBtn = document.getElementById('aumentar-fonte');
	if (aumentarFonteBtn) {
		aumentarFonteBtn.addEventListener('click', function() {
			const html = document.documentElement;
			let fontSize = parseFloat(window.getComputedStyle(html).fontSize);
			if (fontSize < 22) {
				html.style.fontSize = (fontSize + 1) + 'px';
				localStorage.setItem('fonteSize', fontSize + 1);
			} else {
				alert('Tamanho máximo atingido.');
			}
		});
	}

	// Diminuir Fonte
	const diminuirFonteBtn = document.getElementById('diminuir-fonte');
	if (diminuirFonteBtn) {
		diminuirFonteBtn.addEventListener('click', function() {
			const html = document.documentElement;
			let fontSize = parseFloat(window.getComputedStyle(html).fontSize);
			if (fontSize > 14) {
				html.style.fontSize = (fontSize - 1) + 'px';
				localStorage.setItem('fonteSize', fontSize - 1);
			} else {
				alert('Tamanho mínimo atingido.');
			}
		});
	}

	// Alto Contraste
	const altoContrasteBtn = document.getElementById('alto-contraste');
	if (altoContrasteBtn) {
		altoContrasteBtn.addEventListener('click', function() {
			document.body.classList.toggle('alto-contraste');
			const isAtivo = document.body.classList.contains('alto-contraste');
			localStorage.setItem('altoContraste', isAtivo);

			// Feedback visual no botão
			this.classList.toggle('ativo', isAtivo);
		});
	}

	// Leitor de Tela
	const leitorTelaBtn = document.getElementById('leitor-tela');
	if (leitorTelaBtn) {
		leitorTelaBtn.addEventListener('click', function() {
			if ('speechSynthesis' in window) {
				// Pausa se já estiver falando
				if (window.speechSynthesis.speaking) {
					window.speechSynthesis.cancel();
					return;
				}

				// Seleciona apenas o conteúdo principal para leitura
				const mainContent = document.querySelector('main')?.textContent || document.body.textContent;
				const utterance = new SpeechSynthesisUtterance(mainContent);
				utterance.lang = 'pt-BR';
				utterance.rate = 0.9;
				window.speechSynthesis.speak(utterance);
			} else {
				alert('Leitor de tela não suportado no seu navegador.');
			}
		});
	}

	// Restaurar preferências ao carregar a página
	function restaurarPreferencias() {
		// Tamanho da fonte
		const savedSize = localStorage.getItem('fonteSize');
		if (savedSize) {
			document.documentElement.style.fontSize = savedSize + 'px';
		}

		// Alto contraste
		if (localStorage.getItem('altoContraste') === 'true') {
			document.body.classList.add('alto-contraste');
			if (altoContrasteBtn) altoContrasteBtn.classList.add('ativo');
		}
	}
	restaurarPreferencias();

	// ============ MELHORIAS ADICIONAIS ============
	// Ícone para links externos
	const linksExternos = document.querySelectorAll('a[target="_blank"]:not(.no-external-icon)');
	linksExternos.forEach(link => {
		if (!link.querySelector('.fa-external-link-alt')) {
			link.innerHTML += ' <i class="fas fa-external-link-alt" aria-hidden="true" style="font-size:0.8em;"></i>';
		}
	});

	// Rolagem suave para links internos
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function(e) {
			const href = this.getAttribute('href');

			if (href !== '#' && href !== '#!') {
				e.preventDefault();

				const targetElement = document.querySelector(href);
				if (targetElement) {
					const header = document.querySelector('header');
					const headerHeight = header ? header.offsetHeight : 0;
					const targetPosition = targetElement.offsetTop - headerHeight;

					window.scrollTo({
						top: targetPosition,
						behavior: 'smooth'
					});

					// Atualiza a URL sem recarregar a página
					if (history.pushState) {
						history.pushState(null, null, href);
					} else {
						location.hash = href;
					}
				}
			}
		});
	});

	// Lazy loading para iframes
	document.querySelectorAll('.site-preview[data-src]').forEach(iframe => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					iframe.src = iframe.getAttribute('data-src');
					observer.unobserve(iframe);
				}
			});
		}, {
			threshold: 0.1
		});

		observer.observe(iframe);
	});

	// Efeito hover nos cards de recursos
	document.querySelectorAll('.recurso-card').forEach(card => {
		const preview = card.querySelector('.preview-container:not(.placeholder)');

		if (preview) {
			const overlay = preview.querySelector('.preview-overlay');
			if (overlay) {
				card.addEventListener('mouseenter', () => {
					overlay.style.opacity = '0';
				});

				card.addEventListener('mouseleave', () => {
					overlay.style.opacity = '1';
				});
			}
		}
	});

  

	// Animações ao rolar a página
	const animateOnScroll = function() {
		const elements = document.querySelectorAll('.beneficio, .curso, .recurso-card, .dica');

		elements.forEach(element => {
			const elementPosition = element.getBoundingClientRect().top;
			const screenPosition = window.innerHeight / 1.2;

			if (elementPosition < screenPosition) {
				element.classList.add('fade-in');
			}
		});
	};

	window.addEventListener('scroll', animateOnScroll);
	animateOnScroll(); // Executa uma vez ao carregar a página
});