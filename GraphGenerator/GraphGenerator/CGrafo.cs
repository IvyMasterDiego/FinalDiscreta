using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GraphGenerator
{
    class CGrafo
    {
        public List<Cvertice> nodos;

        public CGrafo()
        {
            nodos = new List<Cvertice>();
        }

        public Cvertice AgregarVertice(string valor)
        {
            Cvertice nodo = new Cvertice(valor);
            nodos.Add(nodo);
            return nodo;
        }

        public void AgregarVertice(Cvertice nuevonodo)
        {
            nodos.Add(nuevonodo);
        }

        public Cvertice BuscarVertice(string valor)
        {
            return nodos.Find(v => v.Valor == valor);
        }

        public bool AgregarArco(string origen, string nDestino, int peso = 1)
        {
            Cvertice vOrigen, vnDestino;
            if ((vOrigen = nodos.Find(v => v.Valor == origen)) == null)
            {
                throw new Exception("El nodo " + origen + " no existe dentro del grafo");
            }
            if ((vnDestino = nodos.Find(v => v.Valor == origen)) == null)
            {
                throw new Exception("El nodo " + origen + " no existe dentro del grafo");
            }
            return AgregarArco(vOrigen, vnDestino);
        }

        public bool AgregarArco(Cvertice origen, Cvertice nDestino, int peso = 1)
        {
            if(origen.ListaAdyacencia.Find(v=> v.nDestino == nDestino) == null)
            {
                origen.ListaAdyacencia.Add(new CArco(nDestino, peso));
                return true;
            }
            return false;
        }

        public void DibujarGrafo(Graphics g)
        {
            foreach(Cvertice nodo in nodos)
            {
                nodo.DibujarArco(g);
            }

            foreach(Cvertice nodo in nodos)
            {
                nodo.DibujarVertice(g);
            }
        }

        public Cvertice DetectarPunto(Point posicionMouse)
        {
            foreach(Cvertice nodoActual in nodos)
            {
                if (nodoActual.DetectarPunto(posicionMouse))
                    return nodoActual;
            }
                return null;
        }

        public void ReestablecerGrafo(Graphics g)
        {
            foreach(Cvertice nodo in nodos)
            {
                nodo.Color = Color.White;
                nodo.FontColor = Color.Black;
                foreach(CArco arco in nodo.ListaAdyacencia)
                {
                    arco.grosor_flecha = 1;
                    arco.color = Color.Black;
                }
            }
            DibujarGrafo(g);
        }
    }
}
