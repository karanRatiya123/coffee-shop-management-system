package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import Backend.dao.InventoryDAO;
import Backend.model.Inventory;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/InventoryServlet")
public class InventoryServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
	protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        InventoryDAO dao = new InventoryDAO();

        ArrayList<Inventory> list = dao.getAllInventory();

        response.setContentType("application/json");

        PrintWriter out = response.getWriter();

        out.print("[");

        for(int i=0;i<list.size();i++){

            Inventory inventory = list.get(i);

            out.print("{");
            out.print("\"inventoryId\":"+inventory.getInventoryId()+",");
            out.print("\"itemName\":\""+inventory.getItemName()+"\",");
            out.print("\"category\":\""+inventory.getCategory()+"\",");
            out.print("\"quantity\":"+inventory.getQuantity()+",");
            out.print("\"status\":\""+inventory.getStatus()+"\"");
            out.print("}");

            if(i<list.size()-1){
                out.print(",");
            }

        }

        out.print("]");
    }
}