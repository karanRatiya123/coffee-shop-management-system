package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import Backend.dao.OfferDAO;
import Backend.model.Offer;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/OfferServlet")
public class OfferServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
	protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        OfferDAO dao = new OfferDAO();

        ArrayList<Offer> list = dao.getAllOffers();

        response.setContentType("application/json");

        PrintWriter out = response.getWriter();

        out.print("[");

        for(int i=0;i<list.size();i++){

            Offer offer = list.get(i);

            out.print("{");
            out.print("\"offerId\":"+offer.getOfferId()+",");
            out.print("\"offerName\":\""+offer.getOfferName()+"\",");
            out.print("\"discount\":"+offer.getDiscount()+",");
            out.print("\"status\":\""+offer.getStatus()+"\"");
            out.print("}");

            if(i<list.size()-1){
                out.print(",");
            }

        }

        out.print("]");
    }
}