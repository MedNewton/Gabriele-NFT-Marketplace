"use client";
import { useState } from "react";

export default function Dropdown1({
    id,
    defaultSelect = "Dropdown",
    data = ["😍", "🥰", "😘"],
    style = {},
    className = "",
}: {
    id?: string;
    defaultSelect: string;
    data: string[];
    style?: React.CSSProperties;
    className?: string;
}) {
    const [getCurrentSelect, setCurrentSelect] =
        useState<string>(defaultSelect);
    const [isHover, setHover] = useState<boolean>(false);

    const dropdownHoverHandler = () => {
        setHover(true);
    };
    const dropdownLeaveHandler = () => {
        setHover(false);
    };
    const selectHandler = (select: string) => {
        setCurrentSelect(select);
        setHover(false);
    };
    return (
        <>
            <div
                id={id}
                className={`dropdown ${className}`}
                onMouseLeave={dropdownLeaveHandler}
                style={style}
            >
                <a
                    onMouseOver={dropdownHoverHandler}
                    className="btn-selector nolink"
                >
                    {getCurrentSelect}
                </a>
                <ul
                    className={isHover ? "show" : ""}
                    style={
                        !isHover
                            ? { visibility: "hidden" }
                            : { visibility: "visible" }
                    }
                >
                    {data.map((item, index) => (
                        <li
                            onClick={() => selectHandler(item)}
                            key={index}
                            className={
                                item === getCurrentSelect ? "active" : ""
                            }
                        >
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
