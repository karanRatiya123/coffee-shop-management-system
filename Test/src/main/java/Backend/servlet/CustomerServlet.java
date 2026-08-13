package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import Backend.dao.CustomerDAO;
import Backend.model.Customer;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/CustomerServlet")
public class CustomerServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
	protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        CustomerDAO dao = new CustomerDAO();

        ArrayList<Customer> customers = dao.getAllCustomers();

        response.setContentType("application/json");

        PrintWriter out = response.getWriter();

        out.print("[");

        for(int i=0;i<customers.size();i++){

            Customer customer = customers.get(i);

            out.print("{");
            out.print("\"customerId\":"+customer.getCustomerId()+",");
            out.print("\"name\":\""+customer.getName()+"\",");
            out.print("\"phone\":\""+customer.getPhone()+"\",");
            out.print("\"email\":\""+customer.getEmail()+"\",");
            out.print("\"loyaltyPoints\":"+customer.getLoyaltyPoints());
            out.print("}");

            if(i<customers.size()-1){
                out.print(",");
            }

        }

        out.print("]");
    }
}