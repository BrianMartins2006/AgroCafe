# 🚀 ROADMAP: Otimizações AgroCafé

Este documento contém os pontos de melhoria identificados após o primeiro deploy, para serem executados na próxima sessão.

---

## 🛠️ 1. Infraestrutura e Performance
- [ ] **Migração de Imagens:** Mudar de armazenamento local (Render) para **Cloudinary** ou **S3**.
  - *Motivo:* Render apaga arquivos locais no restart; Cloudinary oferece CDN (carregamento instantâneo).
- [ ] **Caching de Dados (React Query):** Implementar cache no frontend para evitar que o app trave em cada troca de página.
- [ ] **Otimização de Banco:** Revisar queries para evitar o "gargalo" que está causando lentidão extrema nas respostas.

## 🔐 2. Privacidade e Segurança
- [ ] **Isolamento de Usuário:** Filtrar todas as Lavouras e Atividades pelo `user_id`.
  - *Status Atual:* Todos os usuários enxergam os mesmos dados (Multitenancy compartilhado).
- [ ] **Gating de Autenticação:** Impedir acesso às rotas da API e páginas do frontend sem token válido.

## 📱 3. Ajustes de Interface (UI/UX Mobile)
- [ ] **Chat - Barra de Input:** Fixar a barra de mensagem no rodapé absoluto (Sticky Bottom).
- [ ] **Tipografia Mobile:** Aumentar o tamanho das fontes e balões de mensagem para melhor legibilidade.
- [ ] **Toasts/Logs:** Reduzir o tempo de exibição dos alertas de sistema nas configurações.
- [ ] **Transições:** Adicionar animações suaves de transição entre páginas.

## 📦 4. Pendências de Deploy
- [ ] **Vercel Env Vars:** Garantir que o `VITE_API_URL` esteja sempre sem acento e atualizado.
- [ ] **PWA Update Logic:** Implementar aviso de "Nova versão disponível" para o usuário.

---

*Documento gerado em: 05/05/2026*
