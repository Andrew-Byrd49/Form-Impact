# Form Impact

A simple, intuitive form builder that allows you to create embeddable forms for your websites.

## Features

- **Drag & Drop Interface**: Easily reorder form fields by dragging them
- **Multiple Field Types**:
  - Text fields
  - Email fields
  - Phone fields
  - Message/Textarea fields
  - Number fields
- **Style Customization**:
  - Background colors
  - Text colors
  - Input colors
  - Border colors and width
  - Border radius
  - Button styling
- **Embeddable Code**: Generate copy-paste code to embed your forms anywhere

## Getting Started

### Running Locally

1. Clone the repository
2. Open `index.html` in your web browser, or run a local server:

```bash
npm start
```

Then visit `http://localhost:8000`

### Using the Form Builder

1. **Add Fields**: Click on the field type buttons in the left panel to add fields to your form
2. **Reorder Fields**: Click and drag fields to reorder them
3. **Edit Labels**: Click on the label text to edit it
4. **Remove Fields**: Click the trash icon to remove a field
5. **Customize Styling**: Use the right panel to adjust colors, borders, and border radius
6. **Get Embed Code**: Copy the generated embed code from the bottom section

### Embedding Your Form

Copy the embed code and paste it into any HTML page where you want your form to appear:

```html
<!-- Paste the embed code here -->
```

The form will work standalone with no dependencies required!

## Project Structure

```
Form-Impact/
├── index.html      # Main form builder interface
├── styles.css      # Styling for the builder
├── app.js          # Form builder logic
├── package.json    # Project metadata
└── README.md       # This file
```

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- Drag and Drop API
- CSS Grid

## License

MIT
