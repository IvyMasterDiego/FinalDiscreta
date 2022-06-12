using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;

namespace GraphGenerator
{
    class CArco
    {
        public Cvertice nDestino;
        public int peso;
        public float grososr_flecha;
        public Color color;
        

        public CArco(Cvertice destino) : this(destino, 1)
        {
            this.nDestino = destino;
        }
        public CArco(Cvertice destino, int peso)
        {
            this.nDestino = destino;
            this.peso = peso;
            this.grososr_flecha = 2;
            this.color = Color.Red;
        }
    }
}
