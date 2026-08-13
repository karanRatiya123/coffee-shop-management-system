package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import Backend.dao.BillingDAO;
import Backend.model.Billing;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/BillingServlet")
public class BillingServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
	protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        BillingDAO dao = new BillingDAO();

        ArrayList<Billing> bills = dao.getAllBills();

        response.setContentType("application/json");

        PrintWriter out = response.getWriter();

        out.print("[");

        for(int i=0;i<bills.size();i++){

            Billing bill = bills.get(i);

            out.print("{");
            out.print("\"billId\":"+bill.getBillId()+",");
            out.print("\"orderId\":"+bill.getOrderId()+",");
            out.print("\"grandTotal\":"+bill.getGrandTotal()+",");
            out.print("\"paymentMethod\":\""+bill.getPaymentMethod()+"\",");
            out.print("\"paymentStatus\":\""+bill.getPaymentStatus()+"\"");
            out.print("}");

            if(i<bills.size()-1){
                out.print(",");
            }

        }

        out.print("]");
    }
}