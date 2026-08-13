package Backend.test;

import Backend.dao.UserDAO;
import Backend.model.user;

public class testlogin {

    public static void main(String[] args) {

        UserDAO dao = new UserDAO();

        user user = dao.login("4285", null); // Replace with a real PIN from your database

        if (user != null) {

            System.out.println("Login Success");
            System.out.println("Name : " + user.getUsername());
            System.out.println("Role : " + user.getRole());
            System.out.println("Email: " + user.getEmail());

        } else {

            System.out.println("Invalid PIN");

        }
    }
}