# Projeto Delta — deploy & infra

## Ambientes

| Ambiente | URL | Origem |
|---|---|---|
| Produção (oficial) | https://projetodelta.vercel.app · `/app/` | Vercel project `projeto-delta` |
| Teste | https://projeto-delta-teste.vercel.app · `/app/` | Vercel project `projeto-delta-teste` |

Ambos usam o mesmo projeto Supabase (`xsoxsxqgscmlvwggidmq`). **Cuidado:** dados criados no ambiente de teste vão para o banco de produção.

## Fluxo de trabalho

1. Alterações são feitas em `site/` numa branch e enviadas ao GitHub.
2. O ambiente de teste é atualizado a partir dessa branch e validado.
3. Depois de aprovado, a produção é atualizada com o mesmo conteúdo de `site/`.

Deploy pela CLI (a partir da pasta `site/`, com `VERCEL_TOKEN` definido no seu terminal):

```bash
cd site
# 1) Ambiente de teste → https://projeto-delta-teste.vercel.app
npx -y vercel@latest link --yes --project projeto-delta-teste --token "$VERCEL_TOKEN"
npx -y vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN"

# 2) Oficial → https://projetodelta.vercel.app (só depois de validar no teste)
npx -y vercel@latest link --yes --project projeto-delta --token "$VERCEL_TOKEN"
npx -y vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN"
```

O `link` grava em `site/.vercel/` qual projeto recebe o deploy — confira antes de rodar o `deploy --prod`. Essa pasta está no `.gitignore`.

Use `vercel login` ou um token guardado em variável de ambiente local. **Nunca** coloque tokens neste repositório nem dentro de `site/` (tudo em `site/` é publicado).

## Landing (`site/index.html` + `site/app.js`)
- CSS inline; 4 capítulos com scroll sobre canvas fixo + seções claras + rodapé
- Canvas com 143 frames webp em `site/frames/`, scroll suave com Lenis
- CTAs apontam para `app/`

## Plataforma (`site/app/`)
- SPA estática sem build, rotas por hash (`#/login`, `#/cadastro`, `#/trilha/...`, `#/licao/...`, `#/perfil`, `#/admin`, `#/tecnicas`)
- supabase-js v2 via esm.sh; chave publishable em `app/config.js` (segura no navegador — a segurança real é RLS + hook)
- `app/content.js` — conteúdo das matérias/lições/questões
- `app/app.css` — tema dark/light, mobile-first

## Supabase
- Project ref: `xsoxsxqgscmlvwggidmq` (us-east-2)
- Schema base: `supabase/schema.sql`; migrações: `supabase/migrations/`
- Hook `before_user_created` (403 para e-mail não escolar) + trigger `handle_new_user` (cria profile + stats)
- RLS: cada usuário só acessa as próprias linhas; em `profiles` só `nome`/`escola` são editáveis
- Confirmação de e-mail obrigatória
- Projetos no plano free são pausados após inatividade — se o site parar de logar, verifique se o projeto está ativo
- Auth → URL Configuration: a URL de teste precisa estar em *Redirect URLs* para os links de confirmação/redefinição de senha voltarem ao ambiente de teste

### Primeiro admin
Todo cadastro nasce como `aluno`. Para promover o primeiro admin, no SQL Editor:
```sql
update public.profiles set tipo_usuario = 'admin' where email = 'EMAIL_DO_ADMIN@escola.edu.br';
```

### Testes
- O Supabase valida o MX do domínio: use domínios reais (ex.: `@usf.edu.br`).
