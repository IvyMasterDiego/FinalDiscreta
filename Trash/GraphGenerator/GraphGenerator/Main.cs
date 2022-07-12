using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GraphGenerator
{
    public partial class Main : Form
    {
        private CGrafo grafo;
        private CVertice nuevonodo;
        private CVertice NodoOrigen;
        private CVertice NodoDestino;
        private int var_control = 0;

        private Vertice ventanaVertice;
        public Main()
        {
            InitializeComponent();
            grafo = new CGrafo();
            nuevonodo = null;
            var_control = 0;
            ventanaVertice = new Vertice();

            this.SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.UserPaint | ControlStyles.OptimizedDoubleBuffer, true);
        }

        private void Pizarra_Paint(object sender, PaintEventArgs e)
        {
            try
            {
                e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                grafo.DibujarGrafo(e.Graphics);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }

        private void Pizarra_MouseLeave(object sender, EventArgs e)
        {
            Pizarra.Refresh();
        }

        private void crearVerticeToolStripMenuItem_Click(object sender, EventArgs e)
        {
            nuevonodo = new CVertice();
            var_control = 2;
        }

        private void Pizarra_MouseUp(object sender, MouseEventArgs e)
        {
            switch (var_control)
            {
                case 1:
                    if ((NodoDestino = grafo.DetectarPunto(e.Location)) != null && NodoOrigen != NodoDestino)
                    {
                        if (grafo.AgregarArco(NodoOrigen, NodoDestino))
                        {
                            int distancia = 0;
                            NodoOrigen.ListaAdyacencia.Find(v => v.nDestino == NodoDestino).peso = distancia;
                        }
                    }
                    var_control = 0;
                    NodoOrigen = null;
                    NodoDestino = null;

                    Pizarra.Refresh();
                    break;
            }
        }

        private void Pizarra_MouseMove(object sender, MouseEventArgs e)
        {
            switch (var_control)
            {
                case 2:
                    if (nuevonodo != null)
                    {
                        int posx = e.Location.X;
                        int posy = e.Location.Y;

                        if (posx < nuevonodo.Dimensiones.Width / 2)
                        {
                            posx = nuevonodo.Dimensiones.Width / 2;
                        }
                        else if (posx > Pizarra.Size.Width - nuevonodo.Dimensiones.Width / 2)
                        {
                            posx = Pizarra.Size.Width - nuevonodo.Dimensiones.Width / 2;
                        }
                        if (posy < nuevonodo.Dimensiones.Height / 2)
                        {
                            posy = nuevonodo.Dimensiones.Height / 2;
                        }
                        else if (posy > Pizarra.Size.Height - nuevonodo.Dimensiones.Width / 2)
                        {
                            posy = Pizarra.Size.Height - nuevonodo.Dimensiones.Width / 2;
                        }

                        nuevonodo.Posicion = new Point(posx, posy);
                        Pizarra.Refresh();
                        nuevonodo.DibujarVertice(Pizarra.CreateGraphics());
                    }
                    break;

                case 1:
                    AdjustableArrowCap bigArrow = new AdjustableArrowCap(4, 4, true);
                    bigArrow.BaseCap = System.Drawing.Drawing2D.LineCap.Triangle;

                    Pizarra.Refresh();
                    Pizarra.CreateGraphics().DrawLine(new Pen(Brushes.Black, 2)
                    {
                        CustomEndCap = bigArrow
                    }, NodoOrigen.Posicion, e.Location);
                    break;
            }
        }

        private void Pizarra_MouseDown(object sender, MouseEventArgs e)
        {
            if (e.Button == System.Windows.Forms.MouseButtons.Left)
            {
                if ((NodoOrigen = grafo.DetectarPunto(e.Location)) != null)
                {
                    var_control = 1;
                }

                if (nuevonodo != null && NodoOrigen == null)
                {
                    ventanaVertice.Visible = false;
                    ventanaVertice.control = false;
                    grafo.AgregarVertice(nuevonodo);
                    ventanaVertice.ShowDialog();

                    if (ventanaVertice.control)
                    {
                        if (grafo.BuscarVertice(ventanaVertice.txtVertice.Text) == null)
                        {
                            nuevonodo.Valor = ventanaVertice.txtVertice.Text;
                        }
                        else
                        {
                            MessageBox.Show("El Nodo " + ventanaVertice.txtVertice.Text + " ya existe en el grafo"
                                , "Error nuevo nodo", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
                        }
                    }
                nuevonodo = null;
                var_control = 0;

                Pizarra.Refresh();
                }
            }
            if (e.Button == System.Windows.Forms.MouseButtons.Right)
            {
                if (var_control == 0)
                {
                    if ((NodoOrigen = grafo.DetectarPunto(e.Location)) != null)
                    {
                        CMSCrearVertice.Text = "Nodo " + NodoOrigen.Valor;
                    }
                    else
                        Pizarra.ContextMenuStrip = this.CMSCrearVertice;
                }
            }
        }
    }
}
