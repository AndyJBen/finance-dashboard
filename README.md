# Finance Dashboard

This project is a React based personal finance dashboard.

## Styles Structure

- **Global styles:** `src/assets/styles/global.css` holds global CSS variables and utility classes used throughout the app.
- **Component styles:** Each component has its own `[Component].css` file located next to its `[Component].jsx` file. For example, the `Footer` component lives in `src/components/Footer` with `Footer.jsx` and `Footer.css` together.

### Example folder layout

```
src/
├── assets/
│   └── styles/
│       └── global.css
├── components/
│   ├── Footer/
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   ├── Sidebar/
│   │   ├── Sidebar.jsx
│   │   └── Sidebar.css
│   └── ...
└── App.jsx
```

This layout keeps styles next to their components while sharing common variables and utilities from `global.css`.
