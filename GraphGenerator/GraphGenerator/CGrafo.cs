using System;
using System.Collections.Generic;
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
    }
}
