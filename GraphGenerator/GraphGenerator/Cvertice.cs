using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Drawing.Drawing2D;
using System.Text;
using System.Threading.Tasks;

namespace GraphGenerator
{
    class Cvertice
    {
        public string Valor;
        public List<CArco> ListaAdyacencia;
        Dictionary<string, short> _banderas;
        Dictionary<string, short> _banderasPredert;


        public Color Color
        {
            get { return color_nodo; }
            set { color_fuente = value; }
        }

        public Point Posicion
        {
            get { return _posicion; }
            set { _posicion = value; }
        }

        public Size Dimensiones
        {
            get { return dimensiones; }
            set
            {
                radio = value.Width / 2;
                dimensiones = value;
            }
        }

        static int size = 35;
        Size dimensiones;
        Color color_nodo;
        Color color_fuente;
        Point _posicion;
        int radio;

        public Cvertice(string Valor)
        {
            this.Valor = Valor;
            this.ListaAdyacencia = new List<CArco>();
            this._banderas = new Dictionary<string, short>();
            this._banderasPredert = new Dictionary<string, short>();
            this.Color = Color.Green;
            this.Dimensiones = new Size(size, size);
            this.FontColor = Color.White;
        }

    }
}
