document.addEventListener("DOMContentLoaded", () => {
    const smokeButton = document.getElementById("smoke-button");
    const manualButton = document.getElementById("add-manual");
    const clearGraphButton = document.getElementById("clear-graph-button");
    const deleteLastButton = document.getElementById("delete-last-button");
    const manualHourSelect = document.getElementById("manual-hour");
    const manualMinuteSelect = document.getElementById("manual-minute");
    const logList = document.getElementById("log-list");
    const counterDisplay = document.getElementById("cigarette-counter");
    const ctx = document.getElementById("smokingChart").getContext("2d");
  
    const interval = 5;
    const intervalsInDay = (24 * 60) / interval;
  
    let smokingCounts = Array(intervalsInDay).fill(0);
    let entryStack = [];
    let totalCigarettes = 0;
  
    const timeLabels = Array.from({ length: intervalsInDay }, (_, i) => {
      const totalMinutes = i * interval;
      const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
      const minutes = (totalMinutes % 60).toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    });
  
    const smokingChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: `Smoking Events (every ${interval} minutes)`,
            data: smokingCounts,
            backgroundColor: "rgba(187, 134, 252, 0.6)",
            borderColor: "#bb86fc",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Time of the Day" } },
          y: { title: { display: true, text: "Smoking Events" }, beginAtZero: true },
        },
      },
    });
  
    const updateCounter = () => {
      counterDisplay.textContent = `Total Cigarettes Smoked: ${totalCigarettes}`;
    };
  
    const addToLogBox = (message) => {
      const logItem = document.createElement("li");
      logItem.textContent = message;
      logList.appendChild(logItem);
    };
  
    const populateLog = () => {
      logList.innerHTML = "";
      entryStack.forEach((intervalIndex) => {
        const hours = Math.floor((intervalIndex * interval) / 60)
          .toString()
          .padStart(2, "0");
        const minutes = ((intervalIndex * interval) % 60)
          .toString()
          .padStart(2, "0");
        addToLogBox(`Smoked at: ${hours}:${minutes}`);
      });
    };
  
    const loadData = () => {
      const savedCounts = localStorage.getItem("smokingCounts");
      const savedEntries = localStorage.getItem("entryStack");
      const savedCigarettes = localStorage.getItem("totalCigarettes");
  
      if (savedCounts) {
        smokingCounts = JSON.parse(savedCounts);
        smokingChart.data.datasets[0].data = smokingCounts; // Update the graph dataset
      }
      if (savedEntries) entryStack = JSON.parse(savedEntries);
      if (savedCigarettes) totalCigarettes = parseInt(savedCigarettes, 10);
  
      updateCounter();
      populateLog();
      smokingChart.update(); // Ensure the graph updates with the loaded data
    };
  
    const saveData = () => {
      localStorage.setItem("smokingCounts", JSON.stringify(smokingCounts));
      localStorage.setItem("entryStack", JSON.stringify(entryStack));
      localStorage.setItem("totalCigarettes", totalCigarettes.toString());
    };
  
    for (let i = 0; i < 24; i++) {
      const hourOption = document.createElement("option");
      hourOption.value = i;
      hourOption.textContent = i.toString().padStart(2, "0");
      manualHourSelect.appendChild(hourOption);
    }
    for (let i = 0; i < 60; i++) {
      const minuteOption = document.createElement("option");
      minuteOption.value = i;
      minuteOption.textContent = i.toString().padStart(2, "0");
      manualMinuteSelect.appendChild(minuteOption);
    }
  
    smokeButton.addEventListener("click", () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const intervalIndex = Math.floor((now.getHours() * 60 + now.getMinutes()) / interval);
      smokingCounts[intervalIndex] += 1;
      entryStack.push(intervalIndex);
      totalCigarettes += 1;
      updateCounter();
      addToLogBox(`Smoked at: ${hours}:${minutes}`);
      smokingChart.update();
      saveData();
    });
  
    manualButton.addEventListener("click", () => {
      const hour = parseInt(manualHourSelect.value, 10);
      const minute = parseInt(manualMinuteSelect.value, 10);
      const intervalIndex = Math.floor((hour * 60 + minute) / interval);
      smokingCounts[intervalIndex] += 1;
      entryStack.push(intervalIndex);
      totalCigarettes += 1;
      updateCounter();
      addToLogBox(`Smoked at: ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
      smokingChart.update();
      saveData();
    });
  
    clearGraphButton.addEventListener("click", () => {
      smokingCounts.fill(0);
      entryStack.length = 0;
      totalCigarettes = 0;
      updateCounter();
      logList.innerHTML = "";
      smokingChart.update();
      saveData();
    });
  
    deleteLastButton.addEventListener("click", () => {
      if (entryStack.length === 0) return;
      const lastIndex = entryStack.pop();
      smokingCounts[lastIndex] = Math.max(0, smokingCounts[lastIndex] - 1);
      totalCigarettes = Math.max(0, totalCigarettes - 1);
      updateCounter();
      logList.lastChild?.remove();
      smokingChart.update();
      saveData();
    });
  
    loadData(); // Load saved data on page load
  });
  