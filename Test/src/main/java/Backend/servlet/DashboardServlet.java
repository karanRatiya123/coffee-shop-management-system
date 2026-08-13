package Backend.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import Backend.dao.CustomerDAO;
import Backend.dao.InventoryDAO;
import Backend.dao.MenuDAO;
import Backend.dao.OrderDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/DashboardServlet")
public class DashboardServlet extends HttpServlet {

    /**
	 *
	 */
	private static final long serialVersionUID = 1L;

	@Override
	protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        MenuDAO menuDAO = new MenuDAO();
        OrderDAO orderDAO = new OrderDAO();
        CustomerDAO customerDAO = new CustomerDAO();
        InventoryDAO inventoryDAO = new InventoryDAO();

        int totalMenu = menuDAO.getAllMenuItems().size();
        int totalOrders = orderDAO.getTodayOrdersCount();
        double todaySales = orderDAO.getTodaySales();
        int itemsSold = orderDAO.getTodayItemsSoldCount();
        int totalCustomers = customerDAO.getAllCustomers().size();
        int lowStock = inventoryDAO.getLowStockItems().size();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        out.print("{");
        out.print("\"menu\":" + totalMenu + ",");
        out.print("\"todaySales\":" + todaySales + ",");
        out.print("\"orders\":" + totalOrders + ",");
        out.print("\"itemsSold\":" + itemsSold + ",");
        out.print("\"customers\":" + totalCustomers + ",");
        out.print("\"lowStock\":" + lowStock);
        out.print("}");
    }
}