import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';

const width = 800; // px
const height = 400; // px
const backgroundColour = '#121212'; // Gelap untuk background

// Inisialisasi ChartJSNodeCanvas
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

export async function generateChart(symbol: string, historyData: any[]): Promise<Buffer> {
  if (!historyData || historyData.length === 0) {
    throw new Error('Data historis tidak tersedia atau kosong.');
  }

  // Mengurutkan data (asumsi data belum terurut berdasarkan tanggal dari bursa awal ke akhir)
  // Kalau dari GoAPI sudah terurut asc/desc sesuaikan. Di sini kita sort ASC by date agar chart naik ke kanan.
  const sortedData = [...historyData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const labels = sortedData.map((d: any) => d.date);
  const dataPoints = sortedData.map((d: any) => d.close);

  const configuration: ChartConfiguration = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `Harga Penutupan ${symbol.toUpperCase()}`,
          data: dataPoints,
          borderColor: '#00FF00', // Neon Green
          backgroundColor: 'rgba(0, 255, 0, 0.1)',
          borderWidth: 2,
          pointRadius: 2, // Titik kecil di chart
          fill: true,
          tension: 0.2 // Kurva halus
        }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          labels: {
            color: '#FFFFFF',
            font: {
              size: 14,
              family: 'Arial'
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#A0A0A0',
            maxTicksLimit: 15
          },
          grid: {
            color: '#333333'
          }
        },
        y: {
          ticks: {
            color: '#A0A0A0'
          },
          grid: {
            color: '#333333'
          }
        }
      }
    }
  };

  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  return imageBuffer;
}
