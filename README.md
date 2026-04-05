# PresetFX

O **PresetFX** é uma vitrine e banco de dados projetado para hospedar e compartilhar presets customizados de equalização de áudio de alta performance para o software [FX Sound](https://www.fxsound.com/).

Seja para extrair o máximo do grave na sua música favorita, ouvir os mínimos detalhes de passos nos jogos FPS mais competitivos, ou elevar a qualidade de headsets de baixo custo, o PresetFX traz a configuração ideal pronta para download direto.

---

## 🎧 Acessando o Site
Acesse nossa vitrine completa e interface gráfica online:
👉 **[https://waltinho17.github.io/presetFX/](https://waltinho17.github.io/presetFX/)**

---

## 🛠️ Como o projeto funciona (Painel do Desenvolvedor)

Este projeto foi construído puramente de forma estática (HTML/CSS/Vanilla JS) para ter hospedagem direta no GitHub Pages e alta performance. Todo layout visual com *Glassmorphism* trabalha independentemente dos dados.

A base de dados do site reside inteiramente no arquivo `presets.json`.

### Passo a passo rápido: Como atualizar a página com novos presets?

Para colocar novos fones no ar você **não precisa programar código HTML**.

1. **Adicione os Arquivos Físicos:** Salve o arquivo de som `.fac` do FX Sound na pasta `presets/`. E adicione uma foto de perfil do fone (sem fundo ou foto inteira) na pasta `images/`.
2. **Edite o Banco de Dados:** Abra o arquivo `presets.json` e adicione o pedaço de código representando as informações do seu novo aparelho, conforme a estrutura:

```json
{
  "modelo": "Nome do Modelo",
  "categoria": "Headset Wireless / In-Ear / Home Theater",
  "imagem": "images/nomedaimagem.webp",
  "tags": ["FPS", "Música"],
  "descricao": "Explique de forma objetiva como o seu preset aprimorou o som do modelo.",
  "arquivo": "presets/nome_do_arquivo.fac"
}
```
*(Lembrete: verifique se adicionou a vírgula para separar da chave anterior.)*

3. **Suba para o GitHub:** Salve o projeto e envie (`git push`) para a nuvem. O site automaticamente montará todos os filtros, textos, fundos dinâmicos e botões de download.
