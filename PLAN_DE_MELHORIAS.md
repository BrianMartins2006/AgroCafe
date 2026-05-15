# Plano de Melhorias AgroCafé - Próximos Passos

## 1. Segurança e Privacidade (Urgente)
- Implementar Login Real (E-mail/Senha ou Google).
- Remover fallbacks de usuário no backend para isolar dados.

## 2. Interface e UX
- **Câmera vs Galeria:** Implementar seletor no chat para o usuário escolher entre tirar foto na hora ou escolher uma da galeria.
- **Ajuste de Horário (Timezone):** Corrigir a discrepância de horas entre o servidor e o cliente (Garantir horário de Brasília UTC-3).
- Corrigir modal de edição de atividades no chat.
- Acelerar animações das barras de ação e toasts.
- Adicionar Skeleton Screens para carregamentos.

## 3. Performance e Escalabilidade (Vercel/Render Free)
- **Análise de Limites:** 
    - **Vercel Free:** 100GB de banda/mês.
    - **Render Free:** Spin-down de 15 min. Cache agressivo necessário.
- Implementar Lazy Loading de imagens do Cloudinary.
- Adicionar compressão de imagem no frontend.

## 4. Confiabilidade (QA)
- Validar fluxo de onboarding para novos usuários.
- Testar comportamento offline básico.

---
*Documento atualizado em 06/05/2026 com foco em usabilidade de campo, limites de infra e fuso horário.*
