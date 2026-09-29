# Projeto Delta

Plataforma gratuita e gamificada de preparação para o ENEM (Matemática e Ciências da Natureza).
Projeto de extensão da Engenharia da Computação — USF Campinas.

- Produção: https://projetodelta.vercel.app
- Teste: https://projeto-delta-teste.vercel.app

## Estrutura

```
site/        Site publicado (estático, sem build) — tudo aqui é público
  index.html, app.js, poster.jpg, frames/   landing page com animação por scroll
  app/                                       plataforma (SPA + Supabase)
  brand/                                     logos e ícones
  vercel.json                                headers de segurança/cache
supabase/    Schema e migrações do banco (não publicado)
design/      Assets de design: mascote, telas, animações, itens da loja (não publicado)
docs/        Documentação de deploy e infraestrutura
```

## Rodar localmente

```bash
cd site
python3 -m http.server 8000
# abra http://localhost:8000 e http://localhost:8000/app/
```

Deploy e ambientes: veja [docs/DEPLOY.md](docs/DEPLOY.md).
