# FX Sound Presets Viewer

A página estática oficial para a hospedagem e compartilhamento dos meus presets customizados para o FX Sound.
Construída com um design super rápido, elegante e com pegada Gamer (Dark Mode com Vermelho Intenso).

## Como adicionar um novo preset?

Para você não precisar nunca mexer em códigos HTML longos ou em CSS, toda a base de dados do site é feita através do arquivo `presets.json`. Siga o passo a passo:

1. **Gere o arquivo do Preset:** Exporte seu equalizador no programa FX Sound. O arquivo geralmente tem final `.fac`.
2. **Coloque na Pasta:** Mova esse seu novo arquivo `.fac` para a pasta `/presets/` do projeto.
3. **Edite o Banco de Dados:** Abra o arquivo principal `presets.json`. Você verá que há uma lista de presets lá. Simplesmente adicione uma nova entrada seguindo o mesmo padrão:

```json
{
  "modelo": "Nome do Fone ou Uso",
  "tags": ["FPS", "Agudos"],
  "descricao": "Uma breve descrição ensinando para que serve o seu preset maravilho.",
  "arquivo": "presets/nome_do_arquivo_exato_que_voce_salvou.fac"
}
```

🚨 Observação: Se não for o último item da lista do JSON, não esqueça de colocar uma vírgula `,` logo após a chave `}` para separar do próximo preset.

4. **Salve e suba os arquivos no GitHub!** O GitHub Pages vai atualizar e a página recarregará os novos Cards automaticamente para qualquer um conseguir baixar.

## Visual e Componentes
- Feito puramente em **HTML, CSS e Vanilla Javascript** (sem bibliotecas externas) para assegurar o funcionamento offline e hospedagem extremamente leve.
- Responsividade completa
- Glassmorphism UI
- Mecanismo de Busca em Tempo Real (Busca por Tags, Título e Descrição Otimizada).
