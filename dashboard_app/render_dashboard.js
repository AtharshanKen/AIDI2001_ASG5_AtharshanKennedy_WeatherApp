function renderDashboardPage(viewModel) {
  const cityOptions = viewModel.cities
    .map(
      (city) =>
        `<option value="${city.key}"${city.selected ? " selected" : ""}>${city.label}</option>`,
    )
    .join("");

  const forecastRows = viewModel.forecastRows
    .map(
      (forecast) => `
        <tr>
          <td>${forecast.date}</td>
          <td>${forecast.avgTemp}</td>
          <td>${forecast.weatherCondition}</td>
          <td>${forecast.outingLabel}</td>
          <td>${forecast.outingReason}</td>
        </tr>`,
    )
    .join("");

  const questionButtons = viewModel.questionLabels
    .map((questionLabel) => `<button type="button" class="question-button">${questionLabel}</button>`)
    .join("");
  const errorBanner = viewModel.errorMessage
    ? `<div class="error-banner" role="alert"><strong>Unsupported city</strong><p>${viewModel.errorMessage}</p></div>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Weather Activity Dashboard</title>
    <style>
      :root {
        --sky: #cbe7f6;
        --cloud: #f4efe4;
        --ink: #1f2d3d;
        --accent: #2f7c63;
        --accent-soft: #d7efe3;
        --panel: rgba(255, 255, 255, 0.92);
        --border: rgba(31, 45, 61, 0.14);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.75), transparent 30%),
          linear-gradient(145deg, var(--sky), var(--cloud));
        min-height: 100vh;
      }

      main {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
        padding: 2rem;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 20px;
        box-shadow: 0 22px 60px rgba(31, 45, 61, 0.12);
        padding: 1.5rem;
      }

      h1,
      h2 {
        margin-top: 0;
      }

      .eyebrow {
        color: var(--accent);
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      form {
        display: grid;
        gap: 0.75rem;
      }

      select,
      button {
        border-radius: 999px;
        border: 1px solid var(--border);
        font: inherit;
        padding: 0.85rem 1rem;
      }

      button {
        background: white;
        cursor: pointer;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }

      th,
      td {
        border-bottom: 1px solid var(--border);
        padding: 0.85rem 0.5rem;
        text-align: left;
        vertical-align: top;
      }

      .question-list {
        display: grid;
        gap: 0.75rem;
      }

      .error-banner {
        background: #fff0e2;
        border: 1px solid #df9460;
        border-radius: 16px;
        margin-bottom: 1rem;
        padding: 0.9rem 1rem;
      }

      .error-banner p {
        margin-bottom: 0;
      }

      @media (max-width: 900px) {
        main {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="panel">
        <p class="eyebrow">Weather App</p>
        <h1>Weather Activity Dashboard</h1>
        ${errorBanner}
        <h2>30-Day Forecast</h2>
        <table aria-label="30-day forecast table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Average Temperature</th>
              <th>Condition</th>
              <th>Outing Label</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>${forecastRows}</tbody>
        </table>
      </section>
      <aside>
        <section class="panel">
          <p class="eyebrow">City Selection</p>
          <form method="get" action="/">
            <label for="city">Choose a city</label>
            <select id="city" name="city">${cityOptions}</select>
            <button type="submit">View Forecast</button>
          </form>
        </section>
        <section class="panel">
          <p class="eyebrow">Questions</p>
          <h2>Questions</h2>
          <div class="question-list">${questionButtons}</div>
        </section>
      </aside>
    </main>
  </body>
</html>`;
}

module.exports = {
  renderDashboardPage,
};
