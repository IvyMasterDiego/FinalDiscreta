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

        public Color FontColor
        {
            get { return color_fuente; }
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

        public Cvertice() : this("") { }

        public void DibujarVertice(Graphics g)
        {
            SolidBrush b = new SolidBrush(this.color_nodo);

            Rectangle areaNodo = new Rectangle(this._posicion.X - radio, this._posicion.Y - radio, this.dimensiones.Width, this.dimensiones.Height);

            g.FillEllipse(b, areaNodo);
            g.DrawString(this.Valor, new Font("Times New Roman", 14), new SolidBrush(color_fuente), this._posicion.X, this._posicion.Y, new StringFormat()
            {
                Alignment = StringAlignment.Center,
                LineAlignment = StringAlignment.Center
            });
            g.DrawEllipse(new Pen(Brushes.Black, (float)1.0), areaNodo);
            b.Dispose();
        }

        public void DibujarArco(Graphics g)
        {
            float distancia;
            int difY, difX;

            foreach (CArco arco in ListaAdyacencia)
            {
                difX = this.Posicion.X - arco.nDestino.Posicion.X;
                difY = this.Posicion.Y - arco.nDestino.Posicion.Y;

                distancia = (float)Math.Sqrt((difX * difX + difY * difY));

                AdjustableArrowCap bigArrow = new AdjustableArrowCap(4, 4, true);
                bigArrow.BaseCap = System.Drawing.Drawing2D.LineCap.Triangle;

                g.DrawLine(new Pen(new SolidBrush(arco.color), arco.grosor_flecha)
                {
                    CustomEndCap = bigArrow,
                    Alignment = PenAlignment.Center
                },
                _posicion, new Point(arco.nDestino.Posicion.X + (int)(radio * difX / distancia), arco.nDestino.Posicion.Y + (int)(radio * difY / distancia)));
                g.DrawString(arco.peso.ToString(), new Font("Times New Roman", 12),
                    new SolidBrush(Color.White),
                    this._posicion.X - (int)((difX / 3)),
                    this._posicion.Y - (int)((difY / 3)),
                    new StringFormat()
                    {
                        Alignment = StringAlignment.Center,
                        LineAlignment = StringAlignment.Far
                    });
            }
        }
        public bool DetectarPunto(Point p)
        {
            GraphicsPath posicion = new GraphicsPath();
            posicion.AddEllipse(new Rectangle(this._posicion.X - this.dimensiones.Width / 2,
                this._posicion.Y - this.dimensiones.Height / 2,
                this.dimensiones.Width, this.dimensiones.Height));
            bool retval = posicion.IsVisible(p);
            posicion.Dispose();
            return retval;
        }
        public string ToString()
        {
            return this.Valor;
        }
    }
}


